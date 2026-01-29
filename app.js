(() => {
  const nfInt = new Intl.NumberFormat("ru-RU");
  const nf1 = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const fmt = {
    int: (v) => (typeof v === "number" ? nfInt.format(Math.round(v)) : nfInt.format(Number(v))),
    float1: (v) => nf1.format(Number(v)),
    rub: (v) => `${nfInt.format(Math.round(Number(v)))} ₽`,
    usd: (v) => `$${nf1.format(Number(v))}`,
    stars: (v) => `${nf1.format(Number(v))}★`,
  };

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function formatValue(v, format, path) {
    if (v === null || v === undefined || v === "") return "—";

    // Explicit per-element format wins.
    if (format && fmt[format]) return fmt[format](v);

    // Heuristic fallback for legacy binds without data-format.
    const p = (path || "").toLowerCase();
    if (p.endsWith("_rub") || p.includes("gmv") || p.includes("payout") || p.includes("price")) return fmt.int(v);
    if (p.includes("usd")) return fmt.float1(v);
    if (p.includes("rating")) return fmt.float1(v);
    if (typeof v === "number") return fmt.int(v);
    return String(v);
  }

  function computeDerived(data) {
    // WB derived rating / reviews_total (if not set explicitly)
    const wb = data.wb_metrics || {};
    if (!Number.isFinite(wb.rating) || !Number.isFinite(wb.reviews_total)) {
      const sku = wb.sku_ratings || {};
      const entries = Object.values(sku)
        .map((x) => ({ rating: Number(x.rating), reviews: Number(x.reviews) }))
        .filter((x) => Number.isFinite(x.rating) && Number.isFinite(x.reviews) && x.reviews > 0);

      if (entries.length) {
        const totalReviews = entries.reduce((s, x) => s + x.reviews, 0);
        const weighted = entries.reduce((s, x) => s + x.rating * x.reviews, 0);
        if (!Number.isFinite(wb.reviews_total)) wb.reviews_total = totalReviews;
        if (!Number.isFinite(wb.rating)) wb.rating = Number((weighted / totalReviews).toFixed(1));
      }
      data.wb_metrics = wb;
    }

    // Totals (Ozon + WB) for headline KPIs
    const oz = data.metrics || {};
    const keys = ["orders_total", "orders_delivered", "gmv_rub", "payout_rub"];

    const n = (x) => (typeof x === "number" && Number.isFinite(x) ? x : null);
    const hasWbNumbers = keys.some((k) => n(wb[k]) !== null);

    const total = { market_note: hasWbNumbers ? "Ozon + WB" : "Ozon" };
    keys.forEach((k) => {
      const ozv = n(oz[k]);
      const wbv = n(wb[k]);
      if (ozv === null && wbv === null) total[k] = null;
      else total[k] = (ozv || 0) + (wbv || 0);
    });

    data.total_metrics = total;
    return data;
  }

  function bindAll(data) {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const path = el.getAttribute("data-bind") || "";
      const format = el.getAttribute("data-format") || "";
      const v = getByPath(data, path);
      el.textContent = formatValue(v, format, path);
    });

    document.querySelectorAll("[data-link]").forEach((el) => {
      const path = el.getAttribute("data-link") || "";
      const v = getByPath(data, path);
      if (v) el.setAttribute("href", v);
    });
  }

  async function init() {
    try {
      const res = await fetch("data.json", { cache: "no-store" });
      const data = computeDerived(await res.json());

      // Convenience fields
      data.year = new Date().getFullYear();

      bindAll(data);
    } catch (e) {
      console.error("Failed to load data.json", e);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
