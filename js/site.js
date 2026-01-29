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

  // Brand
  setText('brandTagline', data.brand?.tagline);
  setText('brandPromise', data.brand?.promise);

  // Links
  setManyHref(['tgBtn','tgBtn2','tgBtn3'], data.brand?.links?.telegram_channel);
  setManyHref(['contactBtn'], data.brand?.links?.telegram_contact || data.brand?.links?.telegram_channel);

  // Products links
  setManyHref(['stormWb','stormWb2'], data.brand?.links?.wb_storm);
  setManyHref(['stormOzon','stormOzon2'], data.brand?.links?.ozon_storm);
  setManyHref(['galeWb','galeWb2'], data.brand?.links?.wb_gale);
  setManyHref(['galeOzon','galeOzon2'], data.brand?.links?.ozon_gale);

  // Ratings
  setText('ratingWb', data.socialProof?.wb?.rating);
  setText('ratingOzon', data.socialProof?.ozon?.rating);

  // Prices
  setText('stormPrice', data.products?.find(p=>p.id==='storm')?.priceFrom);
  setText('galePrice', data.products?.find(p=>p.id==='gale')?.priceFrom);
}

main();