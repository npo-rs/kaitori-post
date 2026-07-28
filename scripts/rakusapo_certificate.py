"""らくサポ（海洋散骨）お預かり証明書PDF生成スクリプト。

森（早川のらくサポ対応フロー）がオンデマンドで呼び出す。自動発行はしない。
証明書フッターは NPO法人アールズ 名義（他の署名=株式会社アールズ とは別法人格）。
生成したPDFは output/certificates/（.gitignore対象）に保存し、gitにはコミットしない。

依存: pip install reportlab pillow
"""

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
from reportlab.lib import colors
import os

FONT = "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf"
pdfmetrics.registerFont(TTFont('JP', FONT))


def make_azukari(persons, output_path, issuedate="令和8年7月24日", stamp_path="/home/claude/stamp.png"):
    """
    persons: list of dict { name, memorial }
    例: {"name": "小栗　敏江　様", "memorial": "昭和59年5月24日"}
    """
    c = canvas.Canvas(output_path, pagesize=A4)
    w, h = A4
    dark = colors.Color(0.15, 0.15, 0.15)
    mid = colors.Color(0.93, 0.93, 0.93)

    def t(x, y, text, size=10, color=colors.black, align="left"):
        c.setFont("JP", size)
        c.setFillColor(color)
        yy = h - y*mm
        if align == "left":    c.drawString(x*mm, yy, text)
        elif align == "center": c.drawCentredString(x*mm, yy, text)
        elif align == "right":  c.drawRightString(x*mm, yy, text)

    c.setStrokeColor(colors.black)
    c.setLineWidth(1.5)
    c.line(20*mm, h-38*mm, 190*mm, h-38*mm)
    t(105, 33, "ご遺骨　お預かり証明書", size=20, align="center")
    c.setLineWidth(0.5)
    c.line(20*mm, h-40*mm, 190*mm, h-40*mm)

    t(190, 48, f"発行日：{issuedate}", size=10, align="right")
    t(20, 60, "お客様　各位", size=13)
    t(20, 72, "下記のとおり、ご遺骨をお預かりしたことをここに証明いたします。", size=10)

    t(20, 85, "■ ご遺骨の詳細", size=11)
    top1 = 92
    col = [20, 38, 108, 143, 168]
    c.setFillColor(dark)
    c.rect(20*mm, h-(top1+8)*mm, 170*mm, 8*mm, fill=1, stroke=0)
    for txt, x in [("", col[0]), ("故人様氏名", col[1]), ("ご命日", col[2]), ("粉骨", col[3]), ("海洋散骨", col[4])]:
        t(x+1, top1+5.5, txt, size=9, color=colors.white)

    row_h = 11
    for i, p in enumerate(persons):
        ry = top1 + 8 + i * row_h
        bg = colors.white if i % 2 == 0 else mid
        c.setFillColor(bg)
        c.rect(20*mm, h-(ry+row_h)*mm, 170*mm, row_h*mm, fill=1, stroke=1)
        t(col[0]+2, ry+7, f"【{i+1}】", size=9, color=colors.black)
        t(col[1]+2, ry+7, p['name'], size=9, color=colors.black)
        t(col[2]+2, ry+7, p['memorial'], size=9, color=colors.black)
        t(col[3]+2, ry+7, "5,000円", size=9, color=colors.black)
        t(col[4]+2, ry+7, "8,000円", size=9, color=colors.black)

    n = len(persons)
    sec2_y = top1 + 8 + n * row_h + 12
    t(20, sec2_y, "■ ご依頼内容・費用", size=11)
    top2 = sec2_y + 7
    col2 = [20, 75, 120, 155]
    c.setFillColor(dark)
    c.rect(20*mm, h-(top2+8)*mm, 170*mm, 8*mm, fill=1, stroke=0)
    for txt, x in [("項目", col2[0]), ("単価", col2[1]), ("名数", col2[2]), ("小計", col2[3])]:
        t(x+2, top2+5.5, txt, size=9, color=colors.white)

    rows2 = [
        ("海洋散骨", "8,000円", f"{n}名", f"{8000*n:,}円"),
        ("粉骨費用", "5,000円", f"{n}名", f"{5000*n:,}円"),
    ]
    for i, (item, tanka, meisu, subtotal) in enumerate(rows2):
        ry = top2 + 8 + i * row_h
        bg = colors.white if i % 2 == 0 else mid
        c.setFillColor(bg)
        c.rect(20*mm, h-(ry+row_h)*mm, 170*mm, row_h*mm, fill=1, stroke=1)
        t(col2[0]+2, ry+7, item, size=10, color=colors.black)
        t(col2[1]+2, ry+7, tanka, size=10, color=colors.black)
        t(col2[2]+2, ry+7, meisu, size=10, color=colors.black)
        t(col2[3]+2, ry+7, subtotal, size=10, color=colors.black)

    total_y = top2 + 8 + 2 * row_h
    c.setFillColor(mid)
    c.rect(20*mm, h-(total_y+row_h)*mm, 170*mm, row_h*mm, fill=1, stroke=1)
    t(col2[0]+2, total_y+7, "合　計", size=10, color=colors.black)
    t(col2[3]+2, total_y+7, f"{13000*n:,}円", size=10, color=colors.black)

    footer_y = total_y + row_h + 20
    c.setStrokeColor(colors.Color(0.7, 0.7, 0.7))
    c.line(20*mm, h-(footer_y)*mm, 190*mm, h-(footer_y)*mm)

    t(155, footer_y+8,  "NPO法人アールズ　担当：日比野", size=9, align="right")
    t(155, footer_y+14, "〒462-0012　愛知県名古屋市北区楠4-312-2", size=9, align="right")
    t(155, footer_y+20, "TEL：052-380-7830", size=9, align="right")

    if os.path.exists(stamp_path):
        stamp_x = 158*mm
        stamp_y = h - (footer_y+23)*mm
        stamp_size = 22*mm
        c.drawImage(stamp_path, stamp_x, stamp_y, width=stamp_size, height=stamp_size, mask='auto')

    c.save()


if __name__ == "__main__":
    import sys
    print("このスクリプトは単体実行せず、make_azukari() を呼び出して使ってください。", file=sys.stderr)
