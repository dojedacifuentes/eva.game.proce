#!/usr/bin/env python3
"""
PIEZAS DEL DECK — las imágenes que PowerPoint no sabe dibujar.

pptxgenjs no hace degradados, así que el velo que oscurece la parte baja del
fotograma (para que el texto se lea sobre la captura) se genera aquí como PNG
con transparencia. Y lo mismo la guía del avatar: una placa que marca dónde va
el render de HeyGen mientras no exista el archivo.

    python3 scripts/video/deck/piezas.py

Escribe en scripts/video/deck/piezas/. Colores: los del juego (app/globals.css).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SALIDA = Path(__file__).parent / "piezas"
ANCHO, ALTO = 1080, 1920

FONDO = (6, 7, 11)          # --bg-deep
CIAN = (75, 231, 255)       # --zona-competencia
VIOLETA = (138, 92, 255)    # --zona-recursos
PAPEL = (232, 223, 197)     # --doc-aged


def velo():
    """
    Transparente arriba, negro abajo.

    Tiene que llegar a opaco PRONTO: el texto blanco va en el tercio bajo y
    debajo hay interfaz del juego con sus propios textos. Un degradado suave y
    parejo deja los dos legibles a medias, que es la peor opción. Así que sube
    rápido hasta cubrir del todo y se queda ahí.
    """
    alto = 1200
    cima = 0.42                               # a esta altura ya está opaco
    im = Image.new("RGBA", (ANCHO, alto), (0, 0, 0, 0))
    px = im.load()
    for y in range(alto):
        t = min(1.0, (y / (alto - 1)) / cima)
        t = t * t * (3 - 2 * t)               # suavizado: entra y sale sin filo
        alfa = int(252 * t)
        for x in range(ANCHO):
            px[x, y] = (*FONDO, alfa)
    im.save(SALIDA / "velo.png")


def _fuente(tam):
    """Mono de sistema. Si no está, la de PIL: la guía sigue leyéndose."""
    for ruta in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "C:/Windows/Fonts/consolab.ttf",
    ):
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, tam)
    return ImageFont.load_default()


def _resplandor(d, cx, cy, radio, color, fuerza=34):
    """Halo de neón: círculos concéntricos cada vez más tenues."""
    for i in range(radio, 0, -8):
        t = i / radio
        alfa = int(fuerza * (1 - t) ** 2)
        if alfa <= 0:
            continue
        d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(*color, alfa))


def _guiones(d, caja, color, paso=26, grosor=3):
    """Rectángulo de línea discontinua — marca un hueco por rellenar."""
    x0, y0, x1, y1 = caja
    for x in range(x0, x1, paso * 2):
        d.rectangle([x, y0, min(x + paso, x1), y0 + grosor], fill=color)
        d.rectangle([x, y1 - grosor, min(x + paso, x1), y1], fill=color)
    for y in range(y0, y1, paso * 2):
        d.rectangle([x0, y, x0 + grosor, min(y + paso, y1)], fill=color)
        d.rectangle([x1 - grosor, y, x1, min(y + paso, y1)], fill=color)


def guia_avatar(nombre, etiqueta, caja):
    """Placa de sustitución: aquí va el render del avatar, con este encuadre."""
    im = Image.new("RGBA", (ANCHO, ALTO), (*FONDO, 255))
    halo = Image.new("RGBA", (ANCHO, ALTO), (0, 0, 0, 0))
    d = ImageDraw.Draw(halo)
    _resplandor(d, ANCHO // 2, 520, 760, CIAN, 30)
    _resplandor(d, 140, 1560, 620, VIOLETA, 26)
    im = Image.alpha_composite(im, halo)

    d = ImageDraw.Draw(im)
    # Rejilla tenue: el plano cenital de la ciudad, reducido a su idea.
    for x in range(0, ANCHO, 90):
        d.line([(x, 0), (x, ALTO)], fill=(255, 255, 255, 8))
    for y in range(0, ALTO, 90):
        d.line([(0, y), (ANCHO, y)], fill=(255, 255, 255, 8))

    _guiones(d, caja, (*CIAN, 120))
    d.text((caja[0], caja[1] - 62), etiqueta, fill=(*CIAN, 225), font=_fuente(34))
    d.text((caja[0], caja[3] + 26), "sustituir por el render de HeyGen",
           fill=(*PAPEL, 150), font=_fuente(26))

    im.convert("RGB").save(SALIDA / nombre)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    velo()
    guia_avatar("avatar-medio.png", "AVATAR EVA — PLANO MEDIO", (215, 430, 865, 1400))
    guia_avatar("avatar-cerrado.png", "AVATAR EVA — PLANO CERRADO", (150, 330, 930, 1260))
    print(f"piezas en {SALIDA}")
