/**
 * variantes.js — Phase 2 CECB+ : Variantes
 * Formulaire variantes + textes détaillés (15 champs × 4000 car.)
 */

const VARIANTES = {

  couleurs: { A: '#2196F3', B: '#9C27B0', C: '#FF9800', D: '#F44336' },

  afficher() {
    STATE.initVariantes();
    const container = document.getElementById('variantes-container');
    if (!container) return;
    const variantes = STATE.dossier?.variantes || [];
    container.innerHTML = '';
    variantes.forEach(v => container.appendChild(this.creerCarteVariante(v)));
  },

  creerCarteVariante(v) {
    const color = this.couleurs[v.id] || '#6c757d';
    const mesures = STATE.getMesuresParVariante(v.id);
    const div = document.createElement('div');
    div.className = `variante-card variante-${v.id}`;
    div.dataset.variante = v.id;
    div.innerHTML = `
      <div class="variante-header">
        <span class="variante-label" style="color:${color}">C ${v.id}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:0.8rem;color:#6c757d">${mesures.length} mesure(s)</span>
          <button class="btn-ghost btn-sm" onclick="IA.genererTextesVariante('${v.id}')">✨ Générer textes</button>
          <button class="btn-ghost btn-sm" onclick="VARIANTES.toggleDetails('${v.id}')">▼ Détails</button>
        </div>
      </div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div class="form-group"><label>Dénomination</label><input type="text" class="var-field" data-var="${v.id}" data-key="denomination" value="${v.denomination||''}" placeholder="RENOVATION PARTIELLE OPTION 1"></div>
        <div class="form-group"><label>Durée travaux</label><input type="text" class="var-field" data-var="${v.id}" data-key="duree_travaux" value="${v.duree_travaux||'non défini'}" placeholder="6 mois"></div>
      </div>
      <div class="texte-field-group"><label>Description <small style="color:#9ca3af">max 1000 car.</small></label><textarea class="var-field" data-var="${v.id}" data-key="description" rows="3" maxlength="1000">${v.description||''}</textarea><div class="char-counter">${(v.description||'').length} / 1000</div></div>
      ${mesures.length > 0 ? `<div style="margin-bottom:12px"><label style="font-size:0.8rem;font-weight:600;color:#6c757d;display:block;margin-bottom:6px">Mesures incluses</label><div style="display:flex;flex-wrap:wrap;gap:4px">${mesures.map(m => `<span style="background:${color}15;color:${color};padding:3px 10px;border-radius:99px;font-size:0.78rem;font-weight:600">${m.abrev||m.denomination?.slice(0,20)||m.type}</span>`).join('')}</div></div>` : `<div class="warn-box" style="margin-bottom:12px;font-size:0.8rem">⚠️ Aucune mesure attribuée.</div>`}
      <div id="var-details-${v.id}" style="display:none"><textarea class="var-texte-field" data-var="${v.id}" data-key="enveloppe_general" rows="3" maxlength="4000" placeholder="Gen, non compris">${v.textes?.enveloppe_general||''}</textarea><textarea class="var-texte-field" data-var="${v.id}" data-key="toits" rows="3" maxlength="4000" placeholder="Toits, non compris">${v.textes?.toits||''}</textarea><textarea class="var-texte-field" data-var="${v.id}" data-key="chauffage" rows="3" maxlength="4000" placeholder="Chauffage, non compris">${v.textes?.chauffage||''}</textarea></div>
    `;
    this.binderVariante(div,v);
    return div;
  },

  champTexte(v,key,label) {
    const val=v.textes?.[key]||'';
    return `<div class="texte-field-group" style="margin-bottom:10px"><label style="font-size:0.78rem;font-weight:600;color:#6c757d">${label}</label><textarea class="var-texte-field" data-var="${v.id}" data-key="${key}" rows="3" maxlength="4000" placeholder="Non compris.">${val}</textarea><div class="char-counter">${val.length} / 4000</div></div>`;
  },

  binderVariante(div,v) {
    div.querySelectorAll('.var-field').forEach(field=>{
      const key=field.dataset.key;
      const ev=field.tagName==='SELECT'?'change':'input';
      field.addEventListener(ev,()=>STATE.updateVariante(v.id,{[key]:field.value}));
    });
    div.querySelectorAll('.var-texte-field').forEach(field=>{
      const key=field.dataset.key;
      field.addEventListener('input',()=>{
        const textes={...(STATE.getVariante(v.id)?.textes||{}),[key]:field.value};
        STATE.updateVariante(v.id,{textes});
      });
    });
  },

  toggleDetails(id) {
    const det=document.getElementById(`var-details-${id}`);
    if(!det)return;
    det.style.display=det.style.display==='none'?'block':'none';
  },

  rafraichirVariante(id) {
    const container=document.getElementById('variantes-container');
    if(!container)return;
    const oldCard=container.querySelector(`[data-variante="${id}"]`);
    const v=STATE.getVariante(id);if(!v)return;
    const newCard=this.creerCarteVariante(v);
    if(oldCard)container.replaceChild(newCard,oldCard);
    else container.appendChild(newCard);
  },
};
