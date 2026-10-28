import sys, json, re, subprocess
from PIL import Image, ImageDraw, ImageFont
TR, P = sys.argv[1], sys.argv[2]
OUT = P + "/store"
ACCENT = (0x4e, 0xa8, 0xf5)
HN = "/System/Library/Fonts/HelveticaNeue.ttc"
def F(px, bold=False):
    return ImageFont.truetype(HN, px, index=1 if bold else 0)

# Texterna hämtas ur explanations.js, så bilderna visar exakt det tillägget visar.
js = subprocess.run(["node", "-e", "require('%s/extension/explanations.js');console.log(JSON.stringify(globalThis.PW_EXPLANATIONS.map(e=>({key:e.key,name:e.name,text:e.text,use:e.use||''}))))" % P], capture_output=True, text=True).stdout
EX = {e["key"]: e for e in json.loads(js)}

def wrap(d, text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def bubble(key, s=1.7):
    e = EX[key]
    W = int(320 * s); pad_x, pad_y = int(16 * s), int(14 * s)
    fn, ft = F(int(13 * s)), F(int(15 * s))
    lh_n, lh_t = int(18 * s), int(22 * s)
    tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    inner = W - 2 * pad_x
    nl = wrap(tmp, e["name"], fn, inner); tl = wrap(tmp, e["text"], ft, inner)
    ul = wrap(tmp, e["use"], ft, inner) if e["use"] else []
    h = pad_y + len(nl) * lh_n + int(8 * s) + len(tl) * lh_t
    if ul: h += int(20 * s) + lh_n + int(4 * s) + len(ul) * lh_t
    h += pad_y
    img = Image.new("RGBA", (W, h), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, W - 1, h - 1], radius=int(16 * s), fill=(0, 0, 0), outline=(0x26, 0x28, 0x2b), width=max(1, int(s)))
    y = pad_y
    for l in nl: d.text((pad_x, y), l, font=fn, fill=(0x7f, 0x7f, 0x7f)); y += lh_n
    y += int(8 * s)
    for l in tl: d.text((pad_x, y), l, font=ft, fill=(255, 255, 255)); y += lh_t
    if ul:
        y += int(10 * s); d.line([pad_x, y, W - pad_x, y], fill=(0x26, 0x28, 0x2b), width=max(1, int(s))); y += int(10 * s)
        d.text((pad_x, y), "Nytta", font=fn, fill=(0x7f, 0x7f, 0x7f)); y += lh_n + int(4 * s)
        for l in ul: d.text((pad_x, y), l, font=ft, fill=(255, 255, 255)); y += lh_t
    return img

def pw_circle(size):
    c = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    d.ellipse([0, 0, size - 1, size - 1], fill=ACCENT)
    f = F(int(size * 0.46), True); tw = d.textlength("pw", font=f)
    d.text(((size - tw) / 2, size * 0.18), "pw", font=f, fill=(0, 0, 0))
    return c

def slide(n, key, chip, head1, head2, where, fname):
    W, H = 1280, 800
    img = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(img)
    img.paste(pw_circle(64), (72, 64), pw_circle(64))
    d.text((72, 200), head1, font=F(52, True), fill=(255, 255, 255))
    d.text((72, 264), head2, font=F(52, True), fill=(0x7f, 0x7f, 0x7f))
    d.text((72, 690), where, font=F(24), fill=ACCENT)
    d.text((72, 724), "Inofficiellt tillägg. Plain Words for Enterprise AI SWE.", font=F(20), fill=(0x7f, 0x7f, 0x7f))
    # Knappen som pekaren står på, ritad neutralt, och bubblan under den.
    fc = F(26); cw = int(d.textlength(chip, font=fc)) + 56
    cx, cy = 700, 150
    d.rounded_rectangle([cx, cy, cx + cw, cy + 60], radius=12, fill=(0x26, 0x28, 0x2b))
    d.text((cx + 28, cy + 14), chip, font=fc, fill=(255, 255, 255))
    # pekaren
    px, py = cx + min(cw - 30, 90), cy + 34
    d.polygon([(px, py), (px, py + 34), (px + 9, py + 26), (px + 16, py + 41), (px + 22, py + 38), (px + 15, py + 24), (px + 26, py + 24)], fill=(255, 255, 255), outline=(0, 0, 0))
    b = bubble(key)
    img.paste(b, (cx, cy + 90), b)
    img.save(f"{OUT}/screenshots/{n}_screenshot_{fname}_1280x800.png")

slide(1, "a-scheduled-flow", "Schemalagt molnflöde", "Håll pekaren still", "över en knapp", "I Power Automate", "schemalagt")
slide(2, "create-product-subscribe", "Konfigurera + prenumerera", "Varnar innan", "något kostar pengar", "I Azure-portalen", "prenumerera")
slide(3, "resource-groups", "Resursgrupper", "Orden du möter", "hela tiden", "I Azure-portalen", "resursgrupper")
slide(4, "f-nav-build", "Version", "Även ord som", "blivit fel översatta", "I Foundry", "version")
slide(5, "s-suggest-agent", "Agent", "Fyra verktyg,", "ett tillägg", "I Copilot Studio", "agent")

# Riktiga skärmbilder, beskurna till 16:10 och skalade till 1280x800.
def real(src, x0, name, paint=()):
    im = Image.open(f"{TR}/{src}").convert("RGB")
    d = ImageDraw.Draw(im)
    for box, col in paint: d.rectangle(box, fill=im.getpixel(col) if isinstance(col, tuple) and len(col) == 2 else col)
    w = round(im.height * 1.6)
    im.crop((x0, 0, x0 + w, im.height)).resize((1280, 800), Image.LANCZOS).save(f"{OUT}/screenshots/ui/{name}_1280x800.png")
real("mcp-claude-in-chrome-blob-1793098534962-wut1tl.jpg", 150, "1_screenshot_ui_schemalagt", [((1180, 0, 1402, 44), (1100, 10))])
real("mcp-claude-in-chrome-blob-1793098580458-07nq4h.jpg", 0, "2_screenshot_ui_prenumerera")
real("mcp-claude-in-chrome-blob-1793098614280-jymu93.jpg", 0, "3_screenshot_ui_resursgrupper")
real("mcp-claude-in-chrome-blob-1793098651119-nl79lt.jpg", 316, "4_screenshot_ui_version")
real("mcp-claude-in-chrome-blob-1793098686725-a529tm.jpg", 158, "5_screenshot_ui_agent", [((470, 100, 940, 156), (300, 120))])

# Liten kampanjbild 440x280, samma form som Miro-tillägget.
im = Image.new("RGB", (440, 280), (0, 0, 0)); d = ImageDraw.Draw(im)
c = pw_circle(56); im.paste(c, (32, 32), c)
f = F(34)
d.text((32, 172), "Moln och AI", font=f, fill=ACCENT)
d.text((32 + d.textlength("Moln och AI ", font=f), 172), "förklarat", font=f, fill=(255, 255, 255))
d.text((32, 214), "med vardagliga ord", font=f, fill=(0x7f, 0x7f, 0x7f))
im.save(f"{OUT}/promo_small_440x280.png")
print("klart")
