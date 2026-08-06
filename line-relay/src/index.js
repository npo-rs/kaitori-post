// 見積もり中継Bot（元請グループ → 外注 → 元請グループ、20%上乗せ）
//
// フロー:
//   1. 元請グループ(MOTOUKE_GROUP_ID)内の全テキストメッセージを外注(GAICHU_USER_ID)へ自動転送
//   2. 外注がLINEの「返信」機能で転送メッセージを指定して金額を送信
//   3. quotedMessageId でどの依頼への回答か判定し、金額を抽出
//   4. 金額 × MARKUP_RATE（デフォルト1.2）を元請グループへ自動送信
//   5. 金額を読み取れない/案件が特定できない場合のみ ADMIN_USER_ID へ通知（自動送信はしない）
//
// 未設定の環境変数がある間は、setup用の応答（自分のID通知）を返す。

const LINE_API_BASE = 'https://api.line.me';
const PENDING_TTL_SECONDS = 60 * 60 * 24 * 3; // 3日で自動失効

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('line-relay bot is running', { status: 200 });
    }

    const bodyText = await request.text();
    const signature = request.headers.get('x-line-signature');
    const valid = await verifySignature(bodyText, signature, env.LINE_CHANNEL_SECRET);
    if (!valid) {
      return new Response('invalid signature', { status: 401 });
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return new Response('bad request', { status: 400 });
    }

    const events = payload.events || [];
    ctx.waitUntil(
      Promise.all(events.map((event) => handleEvent(event, env).catch((err) =>
        notifyAdmin(env, `処理エラー: ${err.message}\nevent: ${JSON.stringify(event).slice(0, 500)}`)
      )))
    );

    return new Response('OK', { status: 200 });
  },
};

async function handleEvent(event, env) {
  const source = event.source || {};

  // Bot がグループに参加したとき: グループIDを案内（未設定時のみ）
  if (event.type === 'join' && source.type === 'group') {
    if (!env.MOTOUKE_GROUP_ID) {
      await lineReply(event.replyToken, env,
        `[初期設定] このグループのIDです。\n${source.groupId}\n\nこれを MOTOUKE_GROUP_ID として登録してください。`);
    }
    return;
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    // 画像・スタンプ等は現状未対応。元請グループからの非テキストメッセージのみ管理者に知らせる。
    if (event.type === 'message' && source.type === 'group' && source.groupId === env.MOTOUKE_GROUP_ID) {
      await notifyAdmin(env, `元請グループに画像/スタンプ等（未対応形式）が届きました。手動で外注に転送してください。`);
    }
    return;
  }

  // 1:1メッセージで、外注/管理者のIDが未登録の場合は setup 案内を返す
  if (source.type === 'user' && (!env.GAICHU_USER_ID || !env.ADMIN_USER_ID)) {
    await lineReply(event.replyToken, env,
      `[初期設定] あなたのユーザーIDです。\n${source.userId}\n\n外注のアカウントなら GAICHU_USER_ID に、管理者(あなた)のアカウントなら ADMIN_USER_ID に登録してください。`);
    return;
  }

  // ケース1: 元請グループのメッセージ → 外注へ転送
  if (source.type === 'group' && env.MOTOUKE_GROUP_ID && source.groupId === env.MOTOUKE_GROUP_ID) {
    await forwardToGaichu(event, env);
    return;
  }

  // ケース2: 外注からの返信 → 金額判定 → 元請グループへ
  if (source.type === 'user' && env.GAICHU_USER_ID && source.userId === env.GAICHU_USER_ID) {
    await handleGaichuReply(event, env);
    return;
  }
}

async function forwardToGaichu(event, env) {
  const originalText = event.message.text;
  const senderName = await getGroupMemberName(event.source.groupId, event.source.userId, env);

  const label = senderName ? `${senderName}さんより:\n` : '';
  const res = await lineApi('/v2/bot/message/push', {
    to: env.GAICHU_USER_ID,
    messages: [{ type: 'text', text: `【見積り依頼】\n${label}${originalText}` }],
  }, env);

  const sentId = res && res.sentMessages && res.sentMessages[0] && res.sentMessages[0].id;
  if (!sentId) {
    await notifyAdmin(env, `外注への転送に失敗しました。\n内容: ${originalText}`);
    return;
  }

  await env.PENDING_QUOTES.put(sentId, JSON.stringify({
    groupId: event.source.groupId,
    originalText,
    senderName: senderName || null,
  }), { expirationTtl: PENDING_TTL_SECONDS });
}

async function handleGaichuReply(event, env) {
  const text = event.message.text;
  const quotedMessageId = event.message.quotedMessageId;

  if (!quotedMessageId) {
    await notifyAdmin(env,
      `外注からメッセージが届きましたが、「返信」機能が使われていないためどの案件か判定できません。手動対応してください。\n内容: ${text}`);
    return;
  }

  const raw = await env.PENDING_QUOTES.get(quotedMessageId);
  if (!raw) {
    await notifyAdmin(env,
      `外注からの返信に対応する依頼が見つかりませんでした（期限切れの可能性）。手動対応してください。\n内容: ${text}`);
    return;
  }

  const pending = JSON.parse(raw);
  const price = parsePrice(text);

  if (price === null) {
    await notifyAdmin(env,
      `外注の返信から金額を読み取れませんでした。手動対応してください。\n元の依頼: ${pending.originalText}\n外注の返信: ${text}`);
    return;
  }

  const rate = env.MARKUP_RATE ? Number(env.MARKUP_RATE) : 1.2;
  const markedUp = Math.ceil(price * rate);

  await lineApi('/v2/bot/message/push', {
    to: pending.groupId,
    messages: [{
      type: 'text',
      text: `【見積り回答】\n${pending.originalText}\n\n¥${markedUp.toLocaleString('ja-JP')}`,
    }],
  }, env);

  await env.PENDING_QUOTES.delete(quotedMessageId);
}

// "50000", "50,000円", "5万円", "5.5万" などから円換算の整数を抽出。読み取れなければ null。
function parsePrice(text) {
  const cleaned = text.replace(/[,，\s]/g, '');

  const manMatch = cleaned.match(/([0-9]+(?:\.[0-9]+)?)万/);
  if (manMatch) {
    return Math.round(parseFloat(manMatch[1]) * 10000);
  }

  const numMatch = cleaned.match(/([0-9]+)円?/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return null;
}

async function getGroupMemberName(groupId, userId, env) {
  try {
    const res = await fetch(`${LINE_API_BASE}/v2/bot/group/${groupId}/member/${userId}`, {
      headers: { Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.displayName || null;
  } catch {
    return null;
  }
}

async function lineApi(path, body, env) {
  const res = await fetch(`${LINE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LINE API error ${res.status}: ${errText}`);
  }
  if (res.status === 200) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  return null;
}

async function lineReply(replyToken, env, text) {
  try {
    await lineApi('/v2/bot/message/reply', {
      replyToken,
      messages: [{ type: 'text', text }],
    }, env);
  } catch (err) {
    // reply 失敗は致命的ではないので握りつぶす（replyTokenは短時間で失効するため）
  }
}

async function notifyAdmin(env, text) {
  if (!env.ADMIN_USER_ID) return;
  try {
    await lineApi('/v2/bot/message/push', {
      to: env.ADMIN_USER_ID,
      messages: [{ type: 'text', text: `[BOT通知]\n${text}`.slice(0, 4900) }],
    }, env);
  } catch {
    // 通知自体の失敗はこれ以上できることがない
  }
}

async function verifySignature(body, signature, channelSecret) {
  if (!signature || !channelSecret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(channelSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return computed === signature;
}
