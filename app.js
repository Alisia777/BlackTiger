(function(){
  const fmtInt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));
  const fmt1 = (n) => (Math.round(n*10)/10).toFixed(1);

  function get(obj, path){
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  async function init(){
    try{
      const res = await fetch('data.json', {cache: 'no-store'});
      const data = await res.json();

      document.querySelectorAll('[data-bind]').forEach(el => {
        const path = el.getAttribute('data-bind');
        const v = get(data, path);
        if(v === undefined || v === null) return;

        let out = v;

        if(typeof v === 'number'){
          if(/_rub$|rub\b/i.test(path)) out = fmtInt(v);
          else if(/rating/i.test(path)) out = fmt1(v);
          else if(/usd/i.test(path)) out = fmt1(v);
          else out = fmtInt(v);
        }
        el.textContent = out;
      });

      document.querySelectorAll('[data-link]').forEach(el => {
        const path = el.getAttribute('data-link');
        const v = get(data, path);
        if(!v) return;
        el.setAttribute('href', v);
      });

    }catch(e){
      console.warn('data.json not loaded', e);
    }

    const y = document.getElementById('year');
    if(y) y.textContent = new Date().getFullYear();
  }

  init();
})();