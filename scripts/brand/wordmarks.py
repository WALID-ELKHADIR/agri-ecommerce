"""Vectorise les wordmarks Saqia (latin + arabe) en chemins SVG.

Usage (outil ponctuel, hors du site) :
    python -m venv .venv && .venv/bin/pip install fonttools uharfbuzz
    # Polices (google/fonts, licence OFL) dans <dossier> :
    #   bricolage.ttf            = BricolageGrotesque[opsz,wdth,wght].ttf
    #   plexarabic-semibold.ttf  = IBMPlexSansArabic-SemiBold.ttf
    .venv/bin/python scripts/brand/wordmarks.py <dossier> > wordmarks.json
Puis reporter le JSON dans lib/brand/wordmarks.ts.

Sortie JSON : { "latin": {d, width, height, baseline}, "arabic": {...} }
Les chemins sont en unités de police, origine en haut à gauche de la boîte
englobante (y vers le bas), prêts pour un viewBox="0 0 width height".
"""
import json
import sys
from io import BytesIO

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS = sys.argv[1]


def font_bytes(font: TTFont) -> bytes:
    buf = BytesIO()
    font.save(buf)
    return buf.getvalue()


def shape(font: TTFont, text: str, tracking_em: float, direction: str, script: str, lang: str):
    data = font_bytes(font)
    face = hb.Face(data)
    hbfont = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.direction = direction
    buf.script = script
    buf.language = lang
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    upem = font["head"].unitsPerEm
    glyph_order = font.getGlyphOrder()
    glyphset = font.getGlyphSet()

    track = tracking_em * upem
    n = len(buf.glyph_infos)

    def draw(pen_factory, ox, oy):
        x = 0
        for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
            name = glyph_order[info.codepoint]
            dx, dy = x + pos.x_offset, pos.y_offset
            # y vers le haut dans la police : on retourne l'axe pour le SVG.
            glyphset[name].draw(TransformPen(pen_factory, (1, 0, 0, -1, dx + ox, -dy + oy)))
            x += pos.x_advance + (track if i < n - 1 else 0)

    bounds_pen = BoundsPen(glyphset)
    draw(bounds_pen, 0, 0)
    xmin, ymin, xmax, ymax = bounds_pen.bounds
    path_pen = SVGPathPen(glyphset, ntos=lambda v: f"{round(v, 1):g}")
    draw(path_pen, -xmin, -ymin)
    return {"d": path_pen.getCommands(), "width": round(xmax - xmin, 1), "height": round(ymax - ymin, 1),
            "baseline": round(-ymin, 1), "upem": upem}




bricolage = TTFont(f"{FONTS}/bricolage.ttf")
bold = instantiateVariableFont(bricolage, {"wght": 700, "opsz": 72, "wdth": 100})
latin = shape(bold, "saqia", -0.045, "ltr", "Latn", "fr")

plex = TTFont(f"{FONTS}/plexarabic-semibold.ttf")
arabic = shape(plex, "ساقية", 0, "rtl", "Arab", "ar")

json.dump({"latin": latin, "arabic": arabic}, sys.stdout)
