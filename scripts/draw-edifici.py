"""Draws the isometric buildings of the home page into public/assets/images/:

    python3 scripts/draw-edifici.py            # or pass another output directory

Same 1024x691 canvas, ground tile, hedges, shadow and palette as the brochure placeholders
(edificio-montagna.svg, edificio-ufficio.svg, from dymora-app):
- edificio-casa.svg     Più edifici: a house with a gable roof, a pool and a roof terrace, so it
                        reads differently from the house of the Funzioni scroll story.
"""
import os
import sys

K = 0.466


def P(x, y, z=0):
    return (40 + x + y, 405 + K * (x - y) - z)


def poly(pts, fill, extra=""):
    s = " ".join(f"{a:.1f},{b:.1f}" for a, b in (P(*p) for p in pts))
    return f'<polygon points="{s}" fill="{fill}"{extra}/>'


def box(x0, x1, y0, y1, z0, z1, top, left, right):
    return [
        poly([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], left),
        poly([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], right),
        poly([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], top),
    ]


def tree(x, y, r=24, h=30):
    cx, cy = P(x, y)
    return [
        f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{r * 1.15:.1f}" ry="{r * .46:.1f}" fill="#2F7364" opacity=".55"/>',
        f'<rect x="{cx - 2.6:.1f}" y="{cy - h:.1f}" width="5.2" height="{h:.1f}" fill="#2B231E"/>',
        f'<circle cx="{cx:.1f}" cy="{cy - h - r * .7:.1f}" r="{r:.1f}" fill="url(#ball)"/>',
    ]


WALL_T, WALL_L, WALL_R = "#EBDCC0", "#E0CDA8", "#B39C78"   # warm plaster
ROOF, ROOF_EDGE = "#4A4858", "#3A3846"                      # anthracite tiles
FRAME_L, FRAME_R = "#FAF7F0", "#D9D3C6"                     # white window frames
GLASS_L, GLASS_R = "#3B4258", "#2E3446"                     # dark glass


def window_l(y, xa, xb, za, zb, lit=False, frame=None, glass=None):
    """A framed window on a face y = const; `lit` ones glow warm like the other placeholders."""
    f, frame, glass = 2.5, frame or FRAME_L, glass or GLASS_L
    return [
        poly([(xa - f, y, za - f), (xb + f, y, za - f), (xb + f, y, zb + f), (xa - f, y, zb + f)], frame),
        poly([(xa, y, za), (xb, y, za), (xb, y, zb), (xa, y, zb)], "url(#glow)" if lit else glass),
        poly([(xa, y, za), (xb, y, za), (xb, y, za + 3), (xa, y, za + 3)], frame),  # sill
    ]


def window_r(x, ya, yb, za, zb, lit=False, frame=None, glass=None):
    f, frame, glass = 2.5, frame or FRAME_R, glass or GLASS_R
    return [
        poly([(x, ya - f, za - f), (x, yb + f, za - f), (x, yb + f, zb + f), (x, ya - f, zb + f)], frame),
        poly([(x, ya, za), (x, yb, za), (x, yb, zb), (x, ya, zb)], "url(#glowR)" if lit else glass),
    ]

def ground():
    """The plot: shadow, tile and the two back hedges, as in the brochure placeholders."""
    out = []
    out += [
        '<polygon points="480.0,200.0 985.0,435.3 545.0,640.4 40.0,405.0" fill="#1C1C1A" opacity=".16" filter="url(#soft)" transform="translate(0 16)"/>',
        '<polygon points="40.0,405.0 545.0,640.4 545.0,656.6 40.0,421.3" fill="#4D4A43"/>',
        '<polygon points="985.0,435.3 545.0,640.4 545.0,656.6 985.0,451.6" fill="#36342E"/>',
        '<polygon points="480.0,200.0 985.0,435.3 545.0,640.4 40.0,405.0" fill="url(#ground)"/>',
        '<polygon points="150.0,353.8 172.0,364.0 172.0,344.0 150.0,333.8" fill="#2F7364"/>',
        '<polygon points="502.0,210.3 172.0,364.0 172.0,344.0 502.0,190.3" fill="#21564A"/>',
        '<polygon points="480.0,180.0 502.0,190.3 172.0,344.0 150.0,333.8" fill="#3F9380"/>',
        '<polygon points="458.0,210.3 963.0,445.6 963.0,425.6 458.0,190.3" fill="#2F7364"/>',
        '<polygon points="985.0,435.3 963.0,445.6 963.0,425.6 985.0,415.3" fill="#21564A"/>',
        '<polygon points="480.0,180.0 985.0,415.3 963.0,425.6 458.0,190.3" fill="#3F9380"/>',
    ]

    return out


def casa():
    """A house in warm plaster with an anthracite gable roof, a pool and a roof terrace."""
    out = []
    out += ground()

    # Stone patio and path to the front edge
    STONE = "#E7DCC6"
    out.append(poly([(300, 40), (485, 40), (485, 238), (300, 238)], STONE))
    out.append(poly([(395, 343), (505, 343), (505, 377), (395, 377)], STONE))

    # Pool, sunk in the patio: rim, the two far inner walls, the water
    px0, px1, py0, py1, d = 325, 465, 62, 200, 16
    out.append(poly([(px0, py0), (px1, py0), (px1, py1), (px0, py1)], "#F4EEE2"))
    out.append(poly([(px0 + 6, py1 - 6, 0), (px1 - 6, py1 - 6, 0), (px1 - 6, py1 - 6, -d), (px0 + 6, py1 - 6, -d)], "#2F86AE"))  # wall y = py1
    out.append(poly([(px0 + 6, py0 + 6, 0), (px0 + 6, py1 - 6, 0), (px0 + 6, py1 - 6, -d), (px0 + 6, py0 + 6, -d)], "#3B9CC4"))  # wall x = px0
    out.append(poly([(px0 + 6, py0 + 6, -d + 4), (px1 - 6, py0 + 6, -d + 4), (px1 - 6, py1 - 6, -d + 4), (px0 + 6, py1 - 6, -d + 4)], "url(#water)"))
    # a few highlights on the water
    for (a, b) in [(360, 110), (410, 150), (395, 95)]:
        out.append(poly([(a, b, -d + 4), (a + 24, b, -d + 4), (a + 24, b + 3, -d + 4), (a, b + 3, -d + 4)], "#FFFFFF", ' opacity=".45"'))

    # Two sun loungers on the patio, beside the pool
    for lx in (338, 392):
        out += box(lx, lx + 40, 210, 228, 0, 6, "#FFFFFF", "#DCD8CF", "#B4AEA2")
        out += box(lx, lx + 10, 210, 228, 6, 14, "#FFFFFF", "#DCD8CF", "#B4AEA2")

    # Trees at the back
    out += tree(95, 330, 24, 30)
    out += tree(70, 210, 22, 28)

    # Main volume: two storeys under a gable roof (ridge along y, the gable faces the pool)
    mx0, mx1, my0, my1, mh, rh, o = 120, 270, 205, 385, 118, 78, 10
    xm = (mx0 + mx1) / 2
    out += box(mx0, mx1, my0, my1, 0, mh, WALL_T, WALL_L, WALL_R)
    out.append(poly([(mx0, my0, mh), (mx1, my0, mh), (xm, my0, mh + rh)], WALL_L))  # the gable
    # chimney behind the ridge, then the roof slope facing x+ with its overhang
    out += box(200, 222, 330, 352, mh + 20, mh + rh + 34, "#F2EEE6", "#DCD6CA", "#A8A196")
    out.append(poly([(mx1 + o, my0 - o, mh - 6), (xm, my0 - o, mh + rh), (xm, my1 + o, mh + rh), (mx1 + o, my1 + o, mh - 6)], ROOF))
    for i in range(1, 6):  # tile rows
        t = i / 6
        xa, za = mx1 + o + (xm - mx1 - o) * t, mh - 6 + (rh + 6) * t
        out.append(poly([(xa, my0 - o, za), (xa, my1 + o, za), (xa, my1 + o, za + 1.6), (xa, my0 - o, za + 1.6)], ROOF_EDGE))
    # white fascia along both edges of the gable
    out.append(poly([(mx1 + o, my0 - o, mh - 6), (xm, my0 - o, mh + rh), (xm, my0 - o, mh + rh - 8), (mx1 + o, my0 - o, mh - 14)], "#F6F3EC"))
    out.append(poly([(mx0 - o, my0 - o, mh - 6), (xm, my0 - o, mh + rh), (xm, my0 - o, mh + rh - 8), (mx0 - o, my0 - o, mh - 14)], "#E4DFD4"))
    # windows: two floors on each face, a small one in the gable
    out += window_l(my0, 135, 175, 14, 66, lit=True)     # glass door to the garden
    out += window_l(my0, 208, 252, 26, 62)
    out += window_l(my0, 135, 175, 80, 106, lit=True)
    out += window_l(my0, 208, 252, 80, 106)
    out += window_l(my0, xm - 14, xm + 14, 128, 152)
    out += window_r(mx1, 222, 258, 80, 106)
    out += window_r(mx1, 300, 336, 80, 106, lit=True)
    out += window_r(mx1, 222, 258, 24, 60)

    # Wing: one storey towards the front, its roof a terrace with a glass railing
    wx0, wx1, wy0, wy1, wh = 270, 395, 250, 400, 62
    out += box(wx0, wx1, wy0, wy1, 0, wh, WALL_T, WALL_L, WALL_R)
    out += window_l(wy0, 292, 334, 6, 50, lit=True)  # sliding glass towards the pool
    out += window_l(wy0, 340, 380, 6, 50)
    out += window_r(wx1, 272, 318, 22, 50)
    out.append(poly([(wx1, 343, 0), (wx1, 377, 0), (wx1, 377, 52), (wx1, 343, 52)], FRAME_R))
    out.append(poly([(wx1, 346, 0), (wx1, 374, 0), (wx1, 374, 49), (wx1, 346, 49)], "#7A5540"))  # door
    # roof terrace floor and the glass railing on its two open sides
    out.append(poly([(wx0, wy0, wh + .5), (wx1, wy0, wh + .5), (wx1, wy1, wh + .5), (wx0, wy1, wh + .5)], "#C9A27E"))
    for i in range(8):  # deck boards
        yy = wy0 + 6 + i * 19
        out.append(poly([(wx0, yy, wh + 1), (wx1, yy, wh + 1), (wx1, yy + 1.4, wh + 1), (wx0, yy + 1.4, wh + 1)], "#B38C69"))
    out.append(poly([(wx0, wy0, wh), (wx1, wy0, wh), (wx1, wy0, wh + 22), (wx0, wy0, wh + 22)], "#CFEAF2", ' opacity=".45"'))
    out.append(poly([(wx1, wy0, wh), (wx1, wy1, wh), (wx1, wy1, wh + 22), (wx1, wy0, wh + 22)], "#A9D3E0", ' opacity=".45"'))
    out.append(poly([(wx0, wy0, wh + 22), (wx1, wy0, wh + 22), (wx1, wy0, wh + 24), (wx0, wy0, wh + 24)], "#FFFFFF"))
    out.append(poly([(wx1, wy0, wh + 22), (wx1, wy1, wh + 22), (wx1, wy1, wh + 24), (wx1, wy0, wh + 24)], "#E4E1DA"))
    # a planter on the terrace
    out += box(wx1 - 30, wx1 - 8, wy1 - 40, wy1 - 12, wh, wh + 10, "#5A574F", "#6B675E", "#4D4A43")
    cx, cy = P(wx1 - 19, wy1 - 26, wh + 10)
    out.append(f'<circle cx="{cx:.1f}" cy="{cy - 8:.1f}" r="13" fill="url(#ball)"/>')

    # Trees at the front
    out += tree(205, 80, 26, 32)
    out += tree(470, 410, 22, 28)
    out += tree(460, 290, 20, 26)

    return out


def svg(body, note):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 691">
<!-- {note} -->
<defs>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
<radialGradient id="ball" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#347170"/><stop offset="1" stop-color="#23555B"/></radialGradient>
<linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A3"/><stop offset="1" stop-color="#F5B65C"/></linearGradient>
<linearGradient id="glowR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C77E"/><stop offset="1" stop-color="#D99A48"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#51B396"/><stop offset=".6" stop-color="#5DC6A0"/><stop offset="1" stop-color="#51B396"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD3EA"/><stop offset="1" stop-color="#3FAAD3"/></linearGradient>
</defs>
{chr(10).join(body)}
</svg>
'''


NOTE = "Disegno isometrico nello stile dei segnaposto della brochure (edificio-montagna.svg, edificio-ufficio.svg), tela 1024x691. Generato da scripts/draw-edifici.py."
DRAWINGS = {"edificio-casa.svg": casa}

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "assets", "images")
    for name, draw in DRAWINGS.items():
        with open(os.path.join(out_dir, name), "w", encoding="utf-8") as f:
            f.write(svg(draw(), NOTE))
