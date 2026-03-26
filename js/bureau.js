/**
 * bureau.js — Mode bureau Phase 1 CECB
 */

const BUREAU = {

  refresh() {
    this.afficherElements();
    this.afficherTechnique();
    this.afficherTextes();
  },

  afficherElements() {
    const liste=document.getElementById('bureau-elements-list');
    if(!liste)return;
    const elements=STATE.dossier?.elements||[];
    if(elements.length===0){liste.innerHTML='<div class="placeholder-text">Ajouter d\'abord des éléments en mode Terrain.</div>';return;}
    const groupes={};
    elements.forEach(el=>{ if(!groues[el.type])groupes[el.type]=[]; groupes[el.type].push(el); });
    const titres={toiture:'🏠Toits et plafonds',murs:'🧱Murs extérieurs',fenetres:'🪐Fenêtres',sol:'⬜ Sols',ponts:'🌡Ponts thermiques'};
    let html='';
    Object.entries(groupes).forEach(([type,els])=>{
      if(!titres[type])return;
      html+=`<h3 style="margin:16px 0 8px;font-size:0.95rem;color:var(--green)">${titres[type]}</h3>`;
      els.forEach(el=>{
        const uSug=this.getUSuggeree(el);
        const eiInfo=CONFIG.etats.find(e=>e.value===el.etat)||CONFIG.etats[1];
        html+=`<div class="card" style="margin-bottom:10px" data-el-id="${el.id}"><div class="card-header"><span class="card-title">${el.abrev} — ${el.composition||'non définie'}</span><span style="color:${eiInfo.color};font-size:0.8rem;font-weight:600">${eiInfo.label}</span></div><div class="form-grid" style="grid-template-columns:repeat(3,1fr);gap:10px"><div class="form-group"><label>Surface [m²]</label><input type="number" class="bureau-field" data-el="${el.id}" data-key="surface" value="${el.surface||''}" placeholder="587"></div><div class="form-group"><label>U [W/m²K]</label><input type="number" class="bureau-field" data-el="${el.id}" data-key="u_mesure" value="${el.u_mesure||''}" placeholder="${uSug}" step="0.01"></div><div class="form-group"><label>Nombre</label><input type="number" class="bureau-field" data-el="${el.id}" data-key="nombre" value="${el.nombre||1}" min="1"></div></div>${this.indicateurSIA(el)}<div class="form-group" style="margin-top:10px"><label>Notes bureau</label><input type="text" class="bureau-field" data-el="${el.id}" data-key="notes_bureau" value="${el.notes_bureau||''}" placeholder="Remarques..."></div></div>`;
      });
    });
    liste.innerHTML=html;
    liste.querySelectorAll('.bureau-field').forEach(field=>{
      const elId=field.dataset.el;
      const key=field.dataset.key;
      field.addEventListener('input',()=>{
        STATE.updateElement(elId,{[key]:field.value});
      });
    });
  },

  indicateurSIA(el) {
    const u=parseFloat(el.u_mesure);
    if(!u)return '';
    const sia=CONFIG.sia380;
    const estOp=!['fenetres'].includes(el.type);
    const limit=estOp?sia.limites_renovation.opaques_ext:sia.limites_renovation.fenetres_ext;
    const cible=estOp?sia.cibles.opaques:sia.cibles.fenetres;
    let s,c,t;
    if(u<=cible){s='⭐';c='#22c55e';t=' Excellent - cible SIA ���'+cible+')';}
    else if(u<=limit){s='✓'hc='#84cc16';t=' Conforme - limite SIA ≤«+limit+')';}
    else{s='❠️';c='#ef4444';t=' Dépasse la limite SIA ('+limit+')';}
    return `<div class="sia-indicator" style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:${c}15;border-radius:4px;margin-top:8px;font-size:0.8rem;color:${c}">${s}${t}</div>`;
  },

  getUSuggeree(el) {
    const annee=el.annee||STATE.get('projet.annee_construction');
    const uInit=CONFIG.getUInitial(annee);
    const map={toiture:'toiture',murs:'murs',fenetres:'fenetres',sol:'sol'};
    return uInit[map[el.type]]||'';
  },

  afficherTechnique() {
    const container=document.getElementById('bureau-technique-display');
    if(!container)return;
    const t=STATE.dossier?.technique||{};
    container.innerHTML=`<div class="card"><div class="card-header"><span class="card-title">🔥Chauffage</span></div><div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px"><div><p><strong>Type:</strong> ${t.type_chauffage||'—'}</p><p><strong>Marque:</strong> ${t.marque_chauffage||'—'}</p></div><div><p><strong>Amnée:</strong> ${t.annee_chauffage||'—'}</p><p><strong>Puissance:</strong> ${t.puissance_kw?t.puissance_kw+' kW':'-—'}</p></div></div></div><div class="card" style="margin-top:10px"><div class="card-header"><span class="card-title">💧Eau chaude</span></div><div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px"><div><p><strong>Type:</strong> ${t.type_ecs||'—'}</p><p><strong>Volume:</strong> ${t.volume_ecs_l?t.volume_ecs_l+' L':'└'}</p></div></div></div>`;
  },

  afficherTextes() {
    const container=document.getElementById('textes-cecb-list');
    if(!container)return;
    const textes=STATE.dossier?.textes_cecb||{};
    if(Object.keys(textes).length===0){
      container.innerHTML=`�div class="placeholder-text">Appuyez sur "Générer textes via IA" pour obtenir les textes officiels CECB.</div>`;
      return;
    }
    const sections=[{key:'toits',abel:'Toits'},{key:'murs',label:'Murs'},{key:'fenetres',label:'Fenêtres'},{key:4sols',abel:'Sols'},{key:'chauffage',abel:'Chauffage'},{key:4ecs',label:'ECS'},{key:4ventilation',label:'Ventilation'}];
    container.innerHTML=sections.map(s=>{
      const t=textes[s.key]; if(!t)return '';
      return `<div class="card" style="margin-bottom:10px"><div class="card-header"><span class="card-title">${s.label}</span><button class="btn-ghost btn-sm" onclick="BUREAU.editTexte('${s.key}')">✏️</button></div><p><strong>État:</strong> ${t.etat||'—'}</p><p><strong>Améliorations:</strong> ${t.amelio||'—'}</p></div>`;
    }).join('');
  },

  editTexte(key) {
    const t=STATE,`ussier?.textes_cecb?.[key]||{};
    const modal=document.getElementById('modal-element');
    const body=document.getElementById('modal-element-body');
    if(!modal)return;
    document.getElementById('modal-element-title').textContent='Modifier texte CECB';
    body.innerHTML=`<div class="form-grid"><div class="form-group full"><label>État</label><textarea id="edit-etat" rows="3">${t.etat||''}</textarea></div><div class="form-group full"><label>Améliorations</label><textarea id="edit-amelio" rows="3">${t.amelio||''}</textarea></div></div>`;
    document.getElementById('modal-save').onclick=()=>{
      STATE.dossier.textes_cecb=STATE.dossier.textes_cecb||{};
      STATE.dossier.textes_cecb[key]={etat:document.getElementById('edit-etat').value,amelio:document.getElementById('edit-amelio').value};
      modal.style.display='none';this.afficherTextes();UI.toast('Texte mis à jour ✓''success');
    };
    modal.style.display='flex';
  },
};

window.BUREAU = BUREAU;
