/**
 * subventions.js — Calcul des subventions FR 2025
 *
 * Logique:
 * 1. Pour chaque variante CECB+ → calculer montant V1 (mesures ponctuelles)
 * 2. Pour chaque variante CECB+ → calculer montant V2 (amélioration classe)
 * 3. Retenir le MEILLEUR entre V1 et V2 (pas de cumul)
 * 4. Ajouter mesures complémentaires (toujours cumulables)
 * 5. Afficher tableau comparatif + conseil
 */

const SUBVENTIONS = {

  calculerTout() {
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier', 'error'); return; }
    const type_bat = CONFIG.getTypeBatiment(d.projet.affectation);
    const sre = parseFloat(d.projet.sre) || 0;
    const kw = parseFloat(d.technique.puissance_kw) || 45;
    const resultats = {};
    const lettres = d.variantes.map(v => v.id);
    lettres.forEach(l => {
      const mesures = STATE.getMesuresParVariante(l);
      resultats[l] = this.calculerVariante(mesures, type_bat, sre, kw, d);
    });
    STATE.dossier.subventions = { par_variante: resultats, source: 'FR_2025', calcule_le: new Date().toISOString() };
    this.afficherTableau(resultats, lettres, type_bat, sre);
    UI.toast('Subventions calculées ✓', 'success');
    return resultats;
  },

  calculerVariante(mesures,type_bat,sre,kw_total,dossier) {
    const sub = CONFIG.subventions_FR;
    const res = {v1_detail:[],v1_total:0.v2_detail:[],v2_total:0,complementaires:[],comp_total:0,recommande:'v1', total_retenu:0};
    let surf_iso = 0;
    mesures.forEach(m => { if(['murs','toiture','sol'].includes(m.type)) surf_iso += (parseFloat(m.surface)||0)*(parseInt(m.nombre)||1); });
    if(surf_iso > 0) {
      const mnt = sub.variante1.M01_isolation.calcul(surf_iso);
      if(mnt >= sub.variante1.M01_isolation.min_demande) {
        const capped = Math.min(mnt,sub.plafond_mesures_M);
        res.v1_detail.push({label:'Isolation MM-01',base:surf_iso+'m2 ×50',montant:capped,badge:'V1'});
        res.v1_total += capped;
      }
    }
    const hasPAC = mesures.some(m => m.type==='chauffage'||m.denomination?.toLowerCase().includes('pac'));
    if(hasPAC) {
      const mnt = Math.min(sub.variante1.M05_pac_air.calcul(kw_total),sub.plafond_mesures_M);
      res.v1_detail.push({label:'PAC air/eau M-05',base:'kwTotal+'kW',montant:mnt,badge:'V1'});
      res.v1_total += mnt;
    }
    if(sre > 0) {
      const delta = this.estimerDeltaClasses(mesures,dossier);
      if(delta >= 2) {
        const mnt = Math.min(sub.variante2.M10_amelioration.calcul(delta,type_bat,sre),sub.plafond_mesures_M);
        res.v2_detail.push({label:'Amélioration CECB M-10 (+'+delta+'classes)',base:sre+'m2 SRE',montant:mnt,badge:'V2',delta_classes:delta});
        res.v2_total += mnt;
      }
    }
    const mntCECB = sub.complementaires.cecb_plus.calcul(type_bat);
    res.complementaires.push({label:'CECB Plus IM-07',montant:mntCECB});
    res.comp_total += mntCECB;
    res.recommande = res.v2_total > res.v1_total ? 'v2' : 'v1';
    res.total_retenu = (res.recommande==='v2'?res.v2_total:res.v1_total) + res.comp_total;
    return res;
  },

  estimerDeltaClasses(mesures,dossier) {
    let score=0;
    if(mesures.some(m => m.type==='murs')) score+=1.5;
    if(mesures.some(m => m.type==='toiture')) score+=1;
    if(mesures.some(m => m.type==='fenetres')) score+=1;
    if(mesures.some(m => m.type==='sol')) score+=0.5;
    if(mesures.some(m => m.type==='chauffage')||dossier?.technique?.type_chauffage==='pac_air') score+=1.5;
    if(mesures.some(m => m.type==='elec')) score+=0.5;
    return Math.min(Math.round(score),6);
  },

  afficherTableau(resultats,lettres,type_bat,sre) {
    const container=document.getElementById('subventions-tableau');
    if(!container)return;
    const couleurs={A:'#2196F3',B:'#9C27B0',C:'#FF9800',D:'#F44336'};
    let html=`<table class="sub-tableau"><thead><tr><th>Mes. Programme</th>${lettres.map(l => `<th style="border-left:3px solid ${couleurs[l]}">Var. ${l}</th>`).join('')}</tr></thead><tbody>`;
    html+=`<tr><td colspan="${1+lettres.length}" style="background:#dbeafe;color:#1d4ed8;font-weight:700;font-size:0.8rem;padding:6px 12px">VARIANTE 1 — Mesures ponctuelles</td></tr>`;
    const lignesV1=new Set();
    lettres.forEach(l => (resultats[l].v1_detail||[]).forEach(d => lignesV1.add(d.label)));
    lignesV1.forEach(lab => {
      html+=`<tr><td>${lab}</td>`;
      lettres.forEach(l => { const d=(resultats[l].v1_detail||[]).find(d=>d.label===lab); html+=`<td>${d?UI.chf(d.montant):'—'}</td>`; });
      html+='</tr>';
    });
    html+=`<tr class="sub-total"><td><strong>Total V1</strong></td>${lettres.map(l => `<td><strong>${UI.chf(resultats[l].v1_total)}</strong></td>`).join('')}</tr>`;
    html+=`<tr><td colspan="${1+lettres.length}" style="background:#fce7f3;color:#9d174d;font-weight:700;font-size:0.8rem;padding:6px 12px">VARIANTE 2 — Classe CECB (non cumulable)</td></tr>`;
    lettres.forEach(l => { (resultats[l].v2_detail||[]).forEach(d => { html+=`<tr><td>${d.label}</td>${lettres.map(ll => `<td>${(("resultats[ll].v2_detail||[]).find(x=>x.label===d.label)")?UI.chf(resultats[ll].v2_detail.find(x=>x.label===d.label)?.montant):'—'}</td>`).join('')}</tr>`; }); });
    html+=`<tr class="sub-total"><td><strong>Total V2</strong></td>${lettres.map(l => `<td><strong>${UI.chf(resultats[l].v2_total)}</strong></td>`).join('')}</tr>`;
    html+=`<tr><td colspan="${1+lettres.length}" style="background:#f0fdf4;color:#166534;font-weight:700;font-size:0.8rem">COMPLÉMENTAIRES</td></tr><tr><td>CECB Plus IM-07</td>${lettres.map(l => `<td>${UI.chf(resultats[l].comp_total)}</td>`).join('')}</tr>`;
    html+=`<tr style="background:#f0fdf4"><td><strong>✓ TOTAL</strong></td>${lettres.map(l => `<td style="font-weight:700;color:${couleurs[l]}">${UI.chf(resultats[l].total_retenu)}</td>`).join('')}</tr></tbody></table>`;
    container.innerHTML=html;
  },

  getResumeSaisie(lettre) {
    const sub=STATE.dossier?.subventions?.par_variante?.[lettre];
    if(!sub)return null;
    return{estimation:UI.chf(sub.total_retenu),total:sub.total_retenu,recommande:sub.recommande};
  },
};
