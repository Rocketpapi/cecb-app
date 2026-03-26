/**
 * mesures.js — Phase 2 CECB+ : Mesures
 * Définition des améliorations par élément + attribution variantes
 */

const MESURES = {
  afficher() {
    const container = document.getElementById('mesures-list');
    if (!container) return;
    const mesures = STATE.dossier?.mesures || [];
    if (mesures.length === 0) { container.innerHTML = '<div class="placeholder-text">Aucune mesure définie. Utilisez Copier état initial ou Suggérer automatiquement.</div>'; return; }
    const groupes = {};
    mesures.forEach(m => { if (!groupes[m.type]) groupes[m.type] = []; groupes[m.type].push(m); });
    const titres = { toiture:'🏠 Toits', murs:'|��� Murs', fenetres:'🪐 Fenêtres', sol:'⬜ Sols', ponts:'🌡 Ponts', chauffage:'🔥 Chauffage', ecs:'|��� ECS', ventil:'💨 Ventil', elec:'³ Élec' };
    let html = '';
    Object.keys(groupes).forEach(type => {
      html += `<h3 style="margin:16px 0 8px;color:var(--green)">${titres[type] || type}</h3>`;
      html += `<div style="overflow-x:auto;margin-bottom:4px"><table style="width:100%;border-collapse:collapse;font-size:0.82rem"><thead><tr><th>Abrév.</th><th>Dénomination</th><th>Surface</th><th>U init</th><th>U cible</th><th>Invest.</th><th>Variantes</th><th></th></tr></thead><tbody>`;
      groues[type].forEach(m => {
        html += `<tr data-mesure-id="${m.id}"><td><input type="text" class="mes-field" data-id="${m.id}" data-key="abrev" value="${m.abrev||''}" style="width:60px;padding:4px;border:1px solid #dee2e6;border-radius:4px"></td><td><select class="mes-field" data-id="${m.id}" data-key="denomination" style="width:180px;padding:4px;border:1px solid #dee2e6;border-radius:4px">${this.optionsDenomination(type,m.denomination)}</select></td><td><input type="number" class="mes-field" data-id="${m.id}" data-key="surface" value="${m.surface||''}" style="width:70px;padding:4px;border:1px solid #dee2e6;text-align:right;border-radius:4px"></td><td><input type="number" class="mes-field" data-id="${m.id}" data-key="u_initial" value="${m.u_initial||''}" step="0.01" style="width:60px;padding:4px;border:1px solid #dee2e6;text-align:right;border-radius:4px"></td><td><input type="number" class="mes-field" data-id="${m.id}" data-key="u_cible" value="${m.u_cible||''}" step="0.01" placeholder="${this.getUCible(type)}" style="width:60px;padding:4px;border:1px solid #dee2e6;text-align:right;color:var(--green);font-weight:600;border-radius:4px"></td><td><input type="number" class="mes-field" data-id="${m.id}" data-key="inv_chf" value="${m.investissement||''}" placeholder="${this.getInvestDefault(type)}" style="width:70px;padding:4px;border:1px solid #dee2e6;text-align:right;border-radius:4px"></td><td><div style="display:flex;gap:3px">${['A','B','C','D'].map(v => `<div class="var-chip ${m.variantes?.[v]?'active-'+v:''}" onclick="MESURES.toggleVariante('${m.id}','${v}',this)">${v}</div>`).join('')}</div></td><td><button class="btn-ghost btn-sm" onclick="MESURES.supprimer('${m.id}')">✕</button></td></tr>`;
      });
      html += `</tbody></table></div><button class="btn-secondary btn-sm" style="margin-bottom:8px" onclick="MESURES.ajouterMesure('${type}')">+ Ajouter</button>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.mes-field').forEach(field => {
      const id = field.dataset.id;
      const key = field.dataset.key;
      const innvKey = key === 'inv_chf' ? 'investissement' : key;
      const ev= field.tagName==='SELECT'?'change':'input';
      field.addEventListener(ev,()=>{STATE.updateMesure(id,{[innvKey]:field.value});
        if(key==='denomination'){const uc=this.getUCibleFromDenomination(field.value);if(uc){const r=field.closest('tr');const uf=r?.querySelector('[data-key="u_cible"]');if(uf&&!uf.value){uf.value=uc;STATE.updateMesure(id,{u_cible:uc});}}}
      });
    });
  },
  toggleVariante(mesureId,lettre,chip) {
    const mesure=STATE.dossier?.mesures?.find(m=>m.id===mesureId);if(!mesure)return;
    const variantes={...mesure.variantes};variantes[lettre]=!variantes[lettre];STATE.updateMesure(mesureId,{variantes});
    if(variantes[lettre])chip.classList.add('active-'+lettre);else chip.classList.remove('active-'+lettre);
  },
  ajouterMesure(type) {
    const exist=(STATE,`ussier?.mesures||[]).filter(m=>m.type===type);
    const pref={toiture:'To', murs:'Mu', fenetres:'Fe', sol:'Sx', chauffage:'PC', ecs:'ACC', elec:'PE'};
    const cfg=CONFIG.denominations_cecb;
    const cfgt={toiture:cfg.toiture,murs:cfg.facade,fenetres:cfg.fenetres,sol:cfg.plancher}[type];
    const uInit=CONFIG.getUInitial(STATE.get('projet.annee_construction'));
    const els=STATE.dossier?.elements||[];
    const elM=els.find(e=>e.type===type);
    STATE.addMesure({type,element_id:elM?.id||null,abrev:`${pref[type]||type.slice(0,2).toUpperCase()}-${exist.length+1}`,denomination:cfgt?.label||'',surface:elM?.surface||'',u_initial:elM?.u_mesure||uInit[type==='murs'?'murs':type==='fenetres'?'fenetres':type==='sol'?'sol':'toiture']||'',u_cible:cfgt?.u_cible||'',nombre:elM?.nombre||1,type_modernisation:cfgt?.type_modernisation||'Isolation extérieure',investissement:this.getInvestDefault(type),base_calculs:'Par m²',durée_utilisation:cfgt?.durée_utilisation||40,variantes:{A:false,B:false,C:false,D:false}});
    this.afficher();UI.toast('Mesure ajoutée','success');
  },
  copierEtatInitial() {
    const els=STATE.dossier?.elements||[];if(els.length===0){UI.toast('Ajouter d\'abord des éléments en mode Terrain','error');return;}
    let count=0;
    els.filter(el => ['toiture','murs','fenetres','sol'].includes(el.type)).forEach(el => {
      if(!(STATE.dossier?.mesures||[]).some(m=>m.element_id===el.id)){this.ajouterMesure(el.type);count++;}
    });
    this.afficher();UI.toast(count+' mesure(s) copiée(s)','success');
  },
  suggererAutomatiquement() {
    const els=STATE.dossier?.elements||[];let count=0;
    els.forEach(el => {
      const u=parseFloat(el.u_mesure);if(!u)return;
      const lim=el.type==='fenetres'?CONFIG.sia380.limites_renovation.fenetres_ext:CONFIG.sia380.limites_renovation.opaques_ext;
      if(u>lim&&!(STATE.dossier?.mesures||[]).some(m=>m.element_id===el.id)&&['toiture','murs','fenetres','sol'].includes(el.type)){this.ajouterMesure(el.type);count++;}
    });
    if(['gaz','mazout'].includes(STATE.get('technique.agent_energetique'))&&!(STATE.dossier?.mesures||[]).some(m=>m.type==='chauffage')){
      STATE.addMesure({type:'chauffage',abrev:'PC-1',denomination:'PAC air/eau',type_modernisation:'Nouveau système',investissement:0,durée_utilisation:20,variantes:{A:false,B:false,C:false,D:false}});count++;
    }
    this.afficher();UI.toast(count>0?count+' mesure(s) suggéree(s)':'Aucune mesure','info');
  },
  supprimer(id) { if(!UI.confirm('Supprimer cette mesure ?'))return;STATE.deleteMesure(id);this.afficher();UI.toast('Mesure supprimée','info'); },
  getUCible(type) { return {toiture:CONFIG.denominations_cecb.toiture.u_cible,murs:CONFIG.denominations_cecb.facade.u_cible,fenetres:CONFIG.denominations_cecb.fenetres.u_cible,sol:CONFIG.denominations_cecb.plancher.u_cible}[type]||''; },
  getUCibleFromDenomination(denom) { if(denom.includes('M1_TOITURE'))return CONFIG.denominations_cecb.toiture.u_cible;if(denom.includes('M2_FACADE'))return CONFIG.denominations_cecb.facade.u_cible;if(denom.includes('M3_PLANCHER'))return CONFIG.denominations_cecb.plancher.u_cible;if(denom.includes('Ug 0.7'))return CONFIG.denominations_cecb.fenetres.u_cible;return null; },
  getInvestDefault(type) { return {toiture:390,murs:350,fenetres:1000,sol:170,chauffage:0,ecs:0,elec:0}[type]||0; },
  optionsDenomination(type,sel) {
    const opts={toiture:['M1_TOITURE_RENOV_C.E.','M1_TOITURE_RENOV_C.N.C.'],murs:['M2_FACADE_RENOV_C.E.','M2_FACADE_RENOV_C.N.C.'],fenetres:['Fe PVC neuve 3-IV Ug 0.7 (U=0.9)','Fe PVC neuve 2-IV Ug 1.0 (U=1.1)'],sol:['M3_PLANCHER_RENOV_C.N.C.','M3_PLANCHER_RENOV_C.E.'],chauffage:['Pompe à chaleur air/eau','PAC saumure/eau','CAD'],ecs:['ECS remplacement'],elec:['Photovoltaïque']};
    return(opts[type]||['Mesure personnalisée']).map(o => `<option value="${o}" ${sel===o?'selected':''}>${o.length>40?o.slice(0,40)+'...':o}</option>`).join('');
  },
};
