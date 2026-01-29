// Black Tiger Audio — Investor snapshot
// Data-driven static page (GitHub Pages friendly)

const $ = (id) => document.getElementById(id);

function el(tag, cls, text){
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderList(container, items){
  container.innerHTML = "";
  (items || []).forEach((t) => {
    const li = el("li", "", t);
    container.appendChild(li);
  });
}

function renderKpis(container, kpis){
  container.innerHTML = "";
  (kpis || []).forEach((k) => {
    const card = el("div", "kpi");
    card.appendChild(el("div", "kpi__label", k.label));
    card.appendChild(el("div", "kpi__value", k.value));
    if (k.note) card.appendChild(el("div", "kpi__note", k.note));
    container.appendChild(card);
  });
}

function renderCardsGrid(container, cards){
  container.innerHTML = "";
  (cards || []).forEach((c) => {
    const card = el("div", "card");
    card.appendChild(el("div", "card__title", c.title));
    const ul = el("ul", "clean");
    (c.points || []).forEach((p) => ul.appendChild(el("li", "", p)));
    card.appendChild(ul);
    container.appendChild(card);
  });
}

function renderProducts(container, products){
  container.innerHTML = "";
  (products || []).forEach((p) => {
    const card = el("div", "product");

    const top = el("div", "product__top");
    const meta = el("div", "product__meta");
    meta.appendChild(el("div", "product__code", p.code));
    meta.appendChild(el("div", "product__title", p.title));
    top.appendChild(meta);

    if (p.image){
      const img = el("img", "product__img");
      img.src = p.image;
      img.alt = p.title;
      top.appendChild(img);
    }

    card.appendChild(top);

    const metrics = el("div", "metrics");
    (p.metrics || []).forEach((m) => {
      const box = el("div", "metric");
      box.appendChild(el("div", "metric__label", m.label));
      box.appendChild(el("div", "metric__value", m.value));
      metrics.appendChild(box);
    });
    card.appendChild(metrics);

    container.appendChild(card);
  });
}

function renderDeal(container, deal){
  container.innerHTML = "";
  (deal?.options || []).forEach((opt) => {
    const card = el("div", "card");
    card.appendChild(el("div", "card__title", opt.title));
    if (opt.subtitle) card.appendChild(el("div", "muted small", opt.subtitle));
    const ul = el("ul", "clean");
    (opt.terms || []).forEach((t) => ul.appendChild(el("li", "", t)));
    card.appendChild(ul);
    container.appendChild(card);
  });
}

async function init(){
  const res = await fetch("data.json", { cache: "no-store" });
  const data = await res.json();

  // Meta
  $("updatedPill").textContent = `Обновлено: ${data.updated}`;
  $("heroTitle").textContent = data.brand?.name || "BLACK TIGER AUDIO";
  $("heroTagline").textContent = data.brand?.tagline || "";
  $("missionText").textContent = data.brand?.mission || "";

  // Links
  const deck = data.brand?.links?.deck || "deck.pdf";
  ["deckLink","deckLink2","deckLink3"].forEach((id) => {
    const a = $(id);
    if (!a) return;
    a.href = deck;
  });

  const tg = data.brand?.links?.telegram || "#";
  ["tgLink","tgLinkHero","tgLink2"].forEach((id) => {
    const a = $(id);
    if (!a) return;
    a.href = tg;
  });

  const tgChannel = data.brand?.links?.telegram_channel || tg;
  const tgChannelLink = $("tgChannelLink");
  if (tgChannelLink) tgChannelLink.href = tgChannel;

  const email = data.brand?.links?.email;
  const emailLink2 = $("emailLink2");
  if (emailLink2){
    emailLink2.href = email ? `mailto:${email}` : "#";
    emailLink2.textContent = email ? email : "Email";
  }

  // KPI + lists
  renderKpis($("kpiGrid"), data.kpis);
  renderList($("positioningList"), data.brand?.positioning);

  // Strategy / roadmap / service / founder
  renderCardsGrid($("strategyGrid"), data.strategy);
  renderCardsGrid($("roadmapGrid"), data.roadmap);

  $("founderTitle").textContent = data.founder?.title || "Основатель";
  renderList($("founderList"), data.founder?.points);

  renderList($("serviceList"), data.service);

  // Products + plan + deal
  renderProducts($("productsGrid"), data.products);
  renderCardsGrid($("planGrid"), data.plan90);

  $("dealHeadline").textContent = data.deal?.headline || $("dealHeadline").textContent;
  renderDeal($("dealGrid"), data.deal);

  // Footer year
  $("year").textContent = new Date().getFullYear();
}

init().catch((e) => {
  console.error(e);
});
