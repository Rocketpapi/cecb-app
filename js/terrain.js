/**
 * terrain.js — Mode visite terrain (iPhone)
 */

const TERRAIN = {

  refresh() {
    this.afficherElements();
    UI.syncFields();
    document.querySelectorAll('.photo-zone').forEach(z => {
      if (!z+\\querySelector('.photo-input')) UI.setupPhotoZone(z);
    });
  },

  afficherElements() {
    const liste = document.getElementById('terrain-elements-list');
    if (!liste) return;
    const elements = STATE.dossier?.elements || [];
    if (elements.length === 0) {
      liste.innerHTML = '<div class="placeholder-text">📷 Aucun élément ajouté.<br/<small>Appuyez "+ Ajouter" pour commencer.</small></div>';
      return;
    }
    liste.innerHTML = '';
    elements.forEach(el => liste.appendChild(this.creerCarteElement(el)));
  },

  creerCarteElement(el) {
    const typeInfo = CONFIG.types_elements.find(t => t.id === el.type) || {icon:'🍏',label:el.type};
    const etatInfo = CONFIG.etats.find(e => e.value === el.etat) || CONFIG.etats[1];
    const card = document.createElement('div');
    card.className='element-card'; card.dataset.id=el.id;
    card.innerHTML=`<div class="element-card-header" onclick="this.closest('.element-card').classList.toggle('open')"><span class="element-card-icon">${typeInfo.icon}</span><span class="element-card-label">${el.abrev || typeInfo.label}</span><span class="element-card-status" style="color:${etatInfo.color}">${etatInfo.label}</span><span class="element-card-chevron">▼</span></div><div class="element-card-body">${this.formulaireElement(el)}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn-danger btn-sm" onclick="TERRAIN.supprimerElement('${el.id}')">🗑️</button></div></div>`;
    this.binderElement(card,el); return card;
  },

  formulaireElement(el) {
    const tInfo = CONFIG.types_elements.find(t => t.id === el.type)||{};
    const isEnv = tInfo.categorie==='enveloppe';
    const optEtats = CONFIG.etats.map(e => `<option value="${e.value}" ${el.etat===e.value?'selected':''}>${e.label}</option>`).join('');
    const uInit = CONFIG.getUInitial(STATE.get('projet.annee_construction'));
    const uSug = uInit[el.type==='murs'?'murs':el.type==='fenetres'?'fenetres':el.type==='sol'?'sol':'toiture'];
    return `<div class="form-grid" style="margin-top:10px"><div class="form-group"><label>Abréviation</label><input type="text" class="el-field" data-key="abrev" value="${el.abrev||''}" placeholder="Mu-1"></div><div class="form-group"><label>État</label><select class="el-field" data-key="etat">${optEtats}</select></div>${isEnv?`<div class="form-group"><label>Surface [m²]</label><input type="number" class="el-field" data-key="surface" value="${el.surface||''}"></div><div class="form-group"><label>U [W/m²K]</label><input type="number" class="el-field" data-key="u_mesure" value="${el.u_mesure||''}" placeholder="${uSug||'0.26'}" step="0.01"></div>`:''}<div class="form-group full"><label>Composition</label><input type="text" class="el-field" data-key="composition" value="${el.composition||''}"></div><div class="form-group full"><label>Photos</label><div class="photo-zone" data-element-id="${el.id}">${(el.photos||[]).map(p => `<img src="${p}" class="photo-thumb">`).join('')}${(!el.photos||el.photos.length===0)?'<div class="photo-placeholder">📷 Photos</div>':''}</div></div></div>`;
  },

  binderElement(card,el) {
    card.querySelectorAll('.el-field').forEach(field => {
      const key=field.dataset.key;
      const ev=field.tagName==='SELECT'?'change':'input';
      field.addEventListener(ev, () => {
        STATE.updateElement(el.id,{[key]:field.value});
        if(key==='etat'){const ei=CONFIG.etats.find(e=>e.value===field.value)||CONFIG.etats[1];const st=card.querySelector('.element-card-status');if(st){st.textContent=ei.label;st.style.color=ei.color;}}
        if(key==='abrev'){const lb=card.querySelector('.element-card-label');if(lb)lb.textContent=field.value||CONFIG.types_elements.find(t=>t.id===el.type)?.label||el.type;}
      });
    });
    const photoZone=card.querySelector('.photo-zone');
    if(photoZone){const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.capture='environment';input.style.display='none';photoZone.appendChild(input);photoZone.addEventListener('click',(e)=>{if(e.target.tagName!=='IMG')input.click();});input.addEventListener('change',(e)=>{Array.from(e.target.files).forEach(file=>{ const r=new FileReader();r.onload=(ev)=>{const p=[...(STATE.getElement(el.id)?.photos||[]),ev.target.result];STATE-u{pdateElement(el.id,{photos:p});photoZone.querySelector('.photo-placeholder')?.remove();const im=document.createElement('img');im.src=ev.target.result;im.className='photo-thumb';photoZone.insertBefore(im,input);};r.readAsDataURL(file);});e.target.value='';});}
  },

  ajouterElement() {
    const modal=document.getElementById('modal-element');
    const body=document.getElementById('modal-element-body');
    const title=document.getElementById('modal-element-title');
    if(!modal||!body)return;
    title.textContent='Choisir un type';
    body.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${CONFIG.types_elements.map(t=>`<button class="card" style="border:2px solid #e9ecef;padding:14px;cursor:pointer;text-align:center;background:white" onclick="TERRAIN.creerElement('${t.id}');document.getElementById('modal-element').style.display='none'"><div style="font-size:1.8rem;margin-bottom:6px">${t.icon}</div><div style="font-size:0.85rem;font-weight:600">${t.label}</div></button>`).join('')}</div>`;
    modal.style.display='flex';
  },

  creerElement(type) {
    const tI1=CONFIG.types_elements.find(t=>t.id===type)||{};
    const exi=(STATE.dossier?.elements||[]).filter(e=>e.type===type);
    const pfx={toiture:'To',murs:'Mu',fenetres:'Fe',sol:'Sx',ponts:'Pt',chauffage:'Ch',ecs:'EC',ventil:'Ve',elec:'PE'};
    const id=STATE.addElement({type,abrev:`${pfx[type]||type.slice(0,2).toUpperCase()}-${exi.length+1}`,etat:'bon',surface:'',u_mesure:'',orientation:type==='toiture'?'Horiz':'N',nombre:1,composition:'',annee:STATE.get('projet.annee_construction')||'',notes:'',photos:[]});
    this.afficherElements();
    setTimeout(()=>{const cards=document.querySelectorAll('.element-card');cards[cards.length-1]?.classList.add('open');},100);
  },

  supprimerElement(id) {
    if(!UI.confirm('Supprimer cet élément ?'))return;
    STATE.deleteElement(id); this.afficherElements();
    UI.toast('Élément supprimé','info');
  },
};

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('btn-add-element')?.addEventListener('click',()=>TERRACN-.ajouterElement());
});

window.TERRAIN = TERRAIN;
