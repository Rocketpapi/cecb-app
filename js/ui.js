/**
 * ui.js — Fonctions UI communes
 */

const UI = {
  showSection(id) {
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
    document.getElementById('section-'+id)?.classList.add('active');
    document.querySelector(`.nav-tab[data-section="${id}"]`)?.classList.add('active');
    window.scrollTo(0,0);
  },
  toast(msg,type='info',d=3000) {
    const c=document.getElementById('toast-container'); if(!c)return;
    const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(()=>t.remove(),300);},d);
  },
  showIAModal(t='Génération...') { const m=document.getElementById('modal-ia'); const te=document.getElementById('modal-ia-text'); if(m)m.style.display='flex'; if(te)te.textContent=t; },
  hideIAModal() { const m=document.getElementById('modal-ia'); if(m)m.style.display='none'; },
  bindFields(container) {
    const els=(container||document).querySelectorAll('[data-field]');
    els.forEach(el=>{
      const field=el.getAttribute('data-field'); const val=STATE.get(field);
      if(val!==undefined&&val!==null){if(el.type==='checkbox')el.checked=!!val; else el.value=val||'';}
      const ev=(el.tagName==='SELECT'?'change':(el.type==='checkbox'?'change':'input'));
      el.addEventListener(ev,()=>STATE.set(field,el.type==='checkbox'?el.checked:el.value));
    });
  },
  syncFields(container) {
    const els=(container||document).querySelectorAll('[data-field]');
    els.forEach(el=>{const val=STATE.get(el.getAttribute('data-field')); if(val!==undefined&&val!==null){if(el.type==='checkbox')el.checked=!!val; else el.value=val||'';}});
  },
  updateHeader() {
    const nom=STATE.get('projet.nom')||'Nouveau dossier';
    const loc=STATE.get('projet.localite');
    const p=document.getElementById('header-projet');
    if(p)p.textContent=loc?`${nom} — ${loc}`:nom;
  },
  chf(m){if(!m&&m!==0)return'—';return new Intl.NumberFormat('fr-CH',{style:'currency',currency:'CHF',maximumFractionDigits:0}).format(m);},
  num(v,d=2){if(!v&&v!==0)return'—';return parseFloat(v).toFixed(d);},
  setupPhotoZone(zone) {
    const input=document.createElement('input');
    input.type='file';input.accept='image/*';input.multiple=true;input.capture='environment';input.className='photo-input';zone.appendChild(input);
    zone.addEventListener('click',()=>input.click());
    input.addEventListener('change',(e)=>{
      Array.from(e.target.files).forEach(file=>{
        const reader=new FileReader();
        reader.onload=(ev)=>{
          const img=document.createElement('img');img.src=ev.target.result;img.className='photo-thumb';
          zone.querySelector('.photo-placeholder')?.remove();zone.insertBefore(img,input);
          const f=zone.getAttribute('data-field');
          if(f){const cur=STATE.get(f)||[];const ph=Array.isArray(cur)?cur:[];pv.push(img.src);STATE.set(f,ph);}
        };reader.readAsDataURL(file);
      });
    });
  },
  eetatBadge(etat){const e=CONFIG.etats.find(x=>x.value===etat)||CONFIG.etats[1];return `<span style="background:${e.color}20;color:${e.color};padding:2px 8px;border-radius:99px;font-size:0.75rem;font-weight:600">${e.label}</span>`;},
  confirm(msg){return window.confirm(msg);},
};
