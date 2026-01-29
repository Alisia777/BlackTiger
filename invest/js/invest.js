async function fetchJson(url){
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(e){
    console.warn('Data load failed:', e);
    return null;
  }
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el && value !== undefined && value !== null) el.textContent = value;
}
function setHref(id, value){
  const el = document.getElementById(id);
  if(el && value) el.href = value;
}
function setManyHref(ids, value){
  ids.forEach(id => setHref(id, value));
}

function initModal(){
  const modal = document.getElementById('imgModal');
  if(!modal) return;
  const img = modal.querySelector('img');
  const closeBtn = modal.querySelector('.close');

  function close(){
    modal.classList.remove('open');
    img.src = '';
    img.alt = '';
  }
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) close();
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') close();
  });

  document.querySelectorAll('[data-zoom]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const src = el.getAttribute('data-zoom');
      img.src = src;
      img.alt = 'Preview';
      modal.classList.add('open');
    });
  });
}

async function main(){
  initModal();

  const data = await fetchJson('data.json');
  if(!data) return;

  // Updated
  setText('updatedPill', `Обновлено: ${data.updated || '—'}`);

  // Headline
  setText('heroTagline', data.brand?.tagline);
  setText('missionText', data.brand?.mission);

  // Links
  const deck = data.brand?.links?.deck || 'deck.pdf';
  setManyHref(['deckLink','deckLink2'], deck);
  setManyHref(['tgLink','tgLink2'], data.brand?.links?.telegram_channel);
  setManyHref(['contactLink'], data.brand?.links?.telegram_contact || data.brand?.links?.telegram_channel);
  setManyHref(['emailLink'], data.brand?.links?.email);

  // KPIs
  setText('kpiDelivered', data.metrics?.delivered);
  setText('kpiGmv', data.metrics?.gmv);
  setText('kpiPayout', data.metrics?.payout);
  setText('kpiRating', data.metrics?.rating);

  // Ask
  setText('askAmount', data.ask?.amount);
  setText('askUse', data.ask?.use);
}

main();