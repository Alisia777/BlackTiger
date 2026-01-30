"""Generate a 1‑page teaser PDF deck (deck.pdf) from data.json.

Usage:
  python generate_deck.py

Notes:
  - The website is static; this script is only for regenerating deck.pdf when numbers/contacts update.
  - Uses DejaVu fonts from the OS (Cyrillic friendly).
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data.json"
OUT_PDF = ROOT / "deck.pdf"


def _register_fonts() -> None:
    """Register DejaVu fonts for Cyrillic."""
    font_dir = "/usr/share/fonts/truetype/dejavu"
    fonts = {
        "DejaVu": "DejaVuSans.ttf",
        "DejaVu-Bold": "DejaVuSans-Bold.ttf",
    }
    for name, fname in fonts.items():
        fpath = os.path.join(font_dir, fname)
        if os.path.exists(fpath):
            pdfmetrics.registerFont(TTFont(name, fpath))


def fmt_int(n) -> str:
    try:
        n = int(round(float(n)))
    except Exception:
        return "—"
    return f"{n:,}".replace(",", " ")


def fmt_rub(n) -> str:
    s = fmt_int(n)
    return s if s == "—" else f"{s} ₽"


def draw_round_rect(
    c: Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    r: float = 10,
    *,
    stroke: int = 1,
    fill: int = 0,
    stroke_color=None,
    fill_color=None,
    stroke_width: float = 1,
) -> None:
    if fill_color is not None:
        c.setFillColor(fill_color)
    if stroke_color is not None:
        c.setStrokeColor(stroke_color)
    c.setLineWidth(stroke_width)
    c.roundRect(x, y, w, h, r, stroke=stroke, fill=fill)


def generate_teaser_pdf(out_path: Path, data: dict) -> None:
    W, H = A4

    orange = HexColor("#FF6A00")
    bg = HexColor("#0B0B0B")
    panel = HexColor("#121212")
    border = HexColor("#2A2A2A")
    text = HexColor("#F3F3F3")
    muted = HexColor("#B7B7B7")
    muted2 = HexColor("#8A8A8A")

    c = Canvas(str(out_path), pagesize=A4)

    # Background
    c.setFillColor(bg)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # Header
    header_h = 18 * mm
    c.setFillColor(orange)
    c.rect(0, H - header_h, W, header_h, stroke=0, fill=1)

    # Tiger mark in the header (brand)
    try:
        tiger = ImageReader('assets/tiger-head.png')
        c.drawImage(tiger, W-20*mm, H-header_h+3*mm, width=12*mm, height=12*mm, mask='auto')
    except Exception:
        pass

    c.setFillColor(HexColor("#000000"))
    c.setFont("DejaVu-Bold", 13)
    c.drawCentredString(W / 2, H - header_h / 2 - 4, "BLACK TIGER AUDIO")

    # Title
    x_margin = 18 * mm
    y = H - header_h - 16 * mm
    c.setFillColor(text)
    c.setFont("DejaVu-Bold", 24)
    c.drawString(x_margin, y, "Investor deck — тизер")

    y -= 10 * mm
    c.setFont("DejaVu", 11)
    c.setFillColor(muted)
    c.drawString(
        x_margin,
        y,
        "1 страница. Полная версия, подробная юнит‑экономика и условия — по запросу.",
    )

    y -= 6 * mm
    c.setFont("DejaVu", 10)
    c.setFillColor(muted2)
    updated = data.get("updated_at", "—")
    period = "01.12.2025 — 29.01.2026"  # can be changed if needed
    c.drawString(x_margin, y, f"Период: {period}   •   Обновлено: {updated}")

    y -= 10 * mm

    # Market cards
    card_gap = 10 * mm
    card_w = (W - 2 * x_margin - card_gap) / 2
    card_h = 62 * mm
    card_y = y - card_h

    def market_card(x0: float, title: str, m: dict, *, is_wb: bool) -> None:
        draw_round_rect(
            c,
            x0,
            card_y,
            card_w,
            card_h,
            r=10,
            stroke=1,
            fill=1,
            stroke_color=border,
            fill_color=panel,
        )

        c.setFillColor(text)
        c.setFont("DejaVu-Bold", 12)
        c.drawString(x0 + 10, card_y + card_h - 16, title)

        rating = m.get("rating")
        reviews = m.get("reviews_total")
        rating_str = f"{float(rating):.1f}★" if isinstance(rating, (int, float)) else "—"

        c.setFont("DejaVu", 9.5)
        c.setFillColor(muted)
        c.drawString(
            x0 + 10,
            card_y + card_h - 30,
            f"Рейтинг: {rating_str}   •   Отзывов: {fmt_int(reviews)}",
        )

        inner_pad = 10
        box_gap = 8
        box_w = (card_w - 2 * inner_pad - box_gap) / 2
        box_h = 18 * mm

        boxes = [
            ("Заказы", fmt_int(m.get("orders_total")), "шт"),
            ("Доставлено" if not is_wb else "Выкуплено", fmt_int(m.get("orders_delivered")), "шт"),
            ("GMV (факт)", fmt_rub(m.get("gmv_rub")), ""),
            ("Выплата" if not is_wb else "К перечислению", fmt_rub(m.get("payout_rub")), ""),
        ]

        for i, (label, val, suffix) in enumerate(boxes):
            col = i % 2
            row = i // 2
            bx = x0 + inner_pad + col * (box_w + box_gap)
            by = card_y + inner_pad + (1 - row) * (box_h + box_gap)

            draw_round_rect(
                c,
                bx,
                by,
                box_w,
                box_h,
                r=8,
                stroke=1,
                fill=1,
                stroke_color=border,
                fill_color=HexColor("#0F0F0F"),
            )

            c.setFillColor(muted2)
            c.setFont("DejaVu", 8.8)
            c.drawString(bx + 8, by + box_h - 12, label)

            c.setFillColor(text)
            c.setFont("DejaVu-Bold", 12)
            tail = f" {suffix}" if suffix else ""
            c.drawString(bx + 8, by + 8, f"{val}{tail}".strip())

    market_card(x_margin, "Ozon", data.get("metrics", {}), is_wb=False)
    market_card(x_margin + card_w + card_gap, "Wildberries", data.get("wb_metrics", {}), is_wb=True)

    # Short bullets
    y2 = card_y - 12 * mm
    c.setFillColor(text)
    c.setFont("DejaVu-Bold", 14)
    c.drawString(x_margin, y2, "Коротко о проекте")

    y2 -= 7 * mm
    bullets = [
        "Товар: автоусилители (Storm / Gale) + развитие линейки автозвука.",
        "Принцип: честные характеристики + поддержка клиентов по подключению/настройке.",
        "Traction: продажи, рейтинги 4.8–4.9★, повторные заказы.",
        "Экономика: оптимизированная логистика ($8.9 → $3.3/кг) и управляемая маржа.",
    ]

    c.setFont("DejaVu", 10.5)
    c.setFillColor(muted)
    bullet_x = x_margin + 4
    for b in bullets:
        c.drawString(x_margin, y2, "•")
        c.drawString(bullet_x, y2, b)
        y2 -= 6 * mm

    # Contacts
    footer_y = 18 * mm
    draw_round_rect(
        c,
        x_margin,
        footer_y,
        W - 2 * x_margin,
        18 * mm,
        r=10,
        stroke=1,
        fill=1,
        stroke_color=border,
        fill_color=panel,
    )

    c.setFillColor(text)
    c.setFont("DejaVu-Bold", 10.5)
    c.drawString(x_margin + 12, footer_y + 12 * mm, "Контакты для инвесторов:")

    telegram = data.get("contacts", {}).get("telegram_handle", "@Hardlivers")
    email = data.get("contacts", {}).get("email", "S@artyuhin.ru")

    c.setFillColor(muted)
    c.setFont("DejaVu", 10.5)
    c.drawString(x_margin + 150, footer_y + 12 * mm, f"Telegram: {telegram}   •   Email: {email}")

    c.showPage()
    c.save()


def main() -> None:
    _register_fonts()

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    generate_teaser_pdf(OUT_PDF, data)
    print(f"OK: generated {OUT_PDF}")


if __name__ == "__main__":
    main()
