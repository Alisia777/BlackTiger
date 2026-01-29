async function load(){
  const res = await fetch('data.json', {cache:'no-store'});
  const data = await res.json();

  // Base texts
  document.getElementById('heroTagline').textContent = data.brand?.tagline || '';
  document.getElementById('missionText').textContent = data.brand?.mission || '';
  document.getElementById('updatedPill').textContent = `Обновлено: ${data.updated || '—'}`;

  // Helpers
  const safeSetHref = (id, href) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.href = href || '#';
  };

  // Links
  const deck = data.brand?.links?.deck || 'deck.pdf';
  safeSetHref('deckLink', deck);
  safeSetHref('deckLink2', deck);
  safeSetHref('deckLink3', deck);

  const telegram = data.brand?.links?.telegram || '#';
  safeSetHref('tgLink', telegram);
  safeSetHref('tgLink2', telegram);

  const telegramReviews = data.brand?.links?.telegram_reviews || data.brand?.links?.telegram_channel || telegram;
  safeSetHref('tgReviewsLink', telegramReviews);
  safeSetHref('tgReviewsLink2', telegramReviews);
  safeSetHref('tgReviewsLink3', telegramReviews);

  const email = data.brand?.links?.email || '#';
  safeSetHref('emailLink', email);
  safeSetHref('emailLink2', email);

  // KPIs
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = '';
  (data.kpi || []).forEach(k => {
    const el = document.createElement('div');
    el.className = 'kpi';
    el.innerHTML = `
      <div class="kpi__label">${k.label}</div>
      <div class="kpi__value">${k.value}</div>
      <div class="kpi__note">${k.note || ''}</div>
    `;
    kpiGrid.appendChild(el);
  });

  // Positioning
  const pos = document.getElementById('positioningList');
  pos.innerHTML = '';
  (data.brand?.positioning || []).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    pos.appendChild(li);
  });

  // Strategy
  if (data.strategy) {
    const headlineEl = document.getElementById('strategyHeadline');
    if (headlineEl) headlineEl.textContent = data.strategy.headline || '';

    const pointsEl = document.getElementById('strategyPoints');
    if (pointsEl) {
      pointsEl.innerHTML = '';
      (data.strategy.points || []).forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        pointsEl.appendChild(li);
      });
    }

    const moatEl = document.getElementById('strategyMoat');
    if (moatEl) {
      moatEl.innerHTML = '';
      (data.strategy.moat || []).forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        moatEl.appendChild(li);
      });
    }

    const teamTitleEl = document.getElementById('teamTitle');
    if (teamTitleEl) teamTitleEl.textContent = data.strategy.team?.title || 'Опыт команды';

    const teamBulletsEl = document.getElementById('teamBullets');
    if (teamBulletsEl) {
      teamBulletsEl.innerHTML = '';
      (data.strategy.team?.bullets || []).forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        teamBulletsEl.appendChild(li);
      });
    }
  }

  // Products
  const pg = document.getElementById('productsGrid');
  pg.innerHTML = '';
  (data.products || []).forEach(p => {
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <div class="product__code">${p.code}</div>
      <div class="product__title">${p.title}</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric__label">Средняя цена, ₽</div>
          <div class="metric__value">${Number(p.avg_price).toLocaleString('ru-RU')}</div>
        </div>
        <div class="metric">
          <div class="metric__label">Выплата с 1 шт, ₽</div>
          <div class="metric__value">${Number(p.payout_per_unit).toLocaleString('ru-RU')}</div>
        </div>
        <div class="metric">
          <div class="metric__label">Закупка (COGS), ₽</div>
          <div class="metric__value">${Number(p.cogs).toLocaleString('ru-RU')}</div>
        </div>
        <div class="metric">
          <div class="metric__label">Вклад до межд.логистики/рекламы, ₽</div>
          <div class="metric__value">${Number(p.contribution).toLocaleString('ru-RU')}</div>
        </div>
      </div>
      <div class="muted small" style="margin-top:12px">
        Доставлено: ${p.units_delivered} шт • ${p.note}
      </div>
    `;
    pg.appendChild(el);
  });

  // Plan
  const planGrid = document.getElementById('planGrid');
  planGrid.innerHTML = '';
  (data.plan || []).forEach(step => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div class="card__title">${step.title}</div>
      <div class="card__text">${step.desc}</div>
    `;
    planGrid.appendChild(el);
  });

  // Deal
  const dealGrid = document.getElementById('dealGrid');
  dealGrid.innerHTML = '';
  (data.deal?.options || []).forEach(opt => {
    const el = document.createElement('div');
    el.className = 'deal__card';
    const bullets = (opt.bullets || []).map(b => `<li>${b}</li>`).join('');
    el.innerHTML = `
      <div class="deal__name">${opt.name}</div>
      <ul>${bullets}</ul>
    `;
    dealGrid.appendChild(el);
  });

  document.getElementById('year').textContent = new Date().getFullYear();
}

load();
