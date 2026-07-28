"""印鑑画像の切り抜きスクリプト（初回セットアップ時のみ使用）。

印影が写った template.jpeg から印鑑部分だけを切り抜き、
背景を透過した stamp.png を生成する。座標は元画像のレイアウトに合わせて調整すること。
"""

from PIL import Image
import numpy as np
import sys

def crop_stamp(template_path, output_path="stamp.png",
               left_ratio=0.82, top_ratio=0.845, right_ratio=0.99, bottom_ratio=0.975):
    img = Image.open(template_path)
    w, h = img.size
    left = int(w * left_ratio)
    top = int(h * top_ratio)
    right = int(w * right_ratio)
    bottom = int(h * bottom_ratio)
    crop = img.crop((left, top, right, bottom))
    crop_rgba = crop.convert("RGBA")
    data = np.array(crop_rgba)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    white_mask = (r > 200) & (g > 200) & (b > 200)
    data[white_mask, 3] = 0
    Image.fromarray(data).save(output_path)
    print(f"saved: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python crop_stamp.py <template.jpeg> [output.png]", file=sys.stderr)
        sys.exit(1)
    crop_stamp(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "stamp.png")
