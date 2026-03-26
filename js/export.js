/**
 * export.js - Generation XLS pour le portail CECB
 */

const EXPORT = {
  phase1() {
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier', 'error'); return; }
    const rows = [];
    rows.push(['PROJET', d.projet.nom||'']);
    rows.push(['ADRESSE', d.projet.adresse||'']);
    rows.push(['NPA-LOCALITE', (d.projet.npa||'') + ' ' + (d.projet.localite||'')]);
    rows.push(['ANNEE CONSTRUCTION', d.projet.annee_construction||'']);
    rows.push(['SRE [m2]', d.projet.sre||'']);
    rows.push(['AFFECTATION', d.projet.affectation||'']);
    rows.push(['', '']);
    rows.push(['ELEMENTS ENVELOPPE', 'Type', 'Composition', 'Surface [m2]', 'U [W/m2K]', 'Orientation', 'Etat']);
    (d.elements||[]).forEach(el => {
      if(['toiture','murs','fenetres','sol','ponts'].includes(el.type)) {
        rows.push([el.abrev||'', el.type, el.composition||'', el.surface||'', el.u_mesure||'', el.orientation||'', el.etat||'']);
      }
    });
    rows.push(['', '']);
    rows.push(['TECHNIQUE', '']);
    const t = d.technique||{};
    rows.push(['Chauffage', t.type_chauffage||'']);
    rows.push(['Marque', t.marque_chauffage||'']);
    rows.push(['Annee', t.annee_chauffage||'']);
    rows.push(['Puissance [kW]', t.puissance_kw||'']);
    rows.push(['Agent energetique', t.agent_energetique||'']);
    rows.push(['ECS', t.type_ecs||'']);
    rows.push(['Ventilation', t.type_ventilation||'']);
    rows.push(['', '']);
    rows.push(['TEXTES CECB', '']);
    const textes = d.textes_cecb||{};
    ['toits','murs','fenetres','sols','ponts_thermiques','chauffage','ecs','ventilation','appareils'].forEach(key => {
      const tx = textes[key];
      if(tx) {
        rows.push([key.toUpperCase(),'']);
        rows.push(['Etat:', tx.etat||'']);
        rows.push(['Ameliorations:', tx.amelio||'']);
        rows.push(['', '']);
      }
    });
    this.downloadXLS(rows, 'CECB_P1_' + (d.projet.nom||'Export'));
    UI.toast('Export Phase 1 genere', 'success');
  },

  phase2() {
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier', 'error'); return; }
    const variantes = d.variantes||[];
    if(variantes.length===0){UI.toast('Definissez les variantes','error');return;}
    variantes.forEach(v => {
      const rows = [];
      const mesures = STATE.getMesuresParVariante(v.id);
      rows.push(['VARIANTE ' + v.id, v.denomination||'']);
      rows.push(['Duree travaux', v.duree_travaux||'non defini']);
      rows.push(['Description', v.description||'']);
      rows.push(['', '']);
      rows.push(['MESURES INCLUSES', 'Denomination', 'Surface', 'U initial', 'U cible', 'Invest. CHF/m2']);
      mesures.forEach(m => rows.push([m.abrev||'', m.denomination||'', m.surface||'', m.u_initial||'', m.u_cible||'', m.investissement||'']));
      rows.push(['', '']);
      rows.push(['TEXTES PORTAIL CECB+', '']);
      ['enveloppe_general','toits','autres_plafonds','fenetres','murs_ext','autres_murs','sols_ext','autres_sols','ponts_thermiques','technique_general','chauffage','distribution_ecs','electricite','ventilation'].forEach(key => {
        const text = v.textes?.[key]||'Non compris.';
        rows.push([key, text]);
      });
      const sub = SUBVENTIONS.getResumeSaisie(v.id);
      if(sub){rows.push(['','']);rows.push(['SUBVENTIONS estimees [CHF]', sub.total||0]);rows.push(['Recommandation', sub.recommande||'']);}
      this.downloadXLS(rows, 'CECBplus-Variante' + v.id + '_' + (d.projet.nom||'Export'));
    });
    UI.toast('Export Phase 2 genere (' + variantes.length + ' fichiers)', 'success');
  },

  resume() {
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier', 'error'); return; }
    const rows = [];
    rows.push(['Resume Comparatif - ' + (d.projet.nom||''), '']);
    rows.push(['SRE', d.projet.sre||'']);
    rows.push(['', '']);
    const variantes = d.variantes||[];
    const subRes = d.subventions?.par_variante||{};
    rows.push(['VARIANTE', 'DENOMINATION', 'MESURES', 'SUBV estimees [CHF]', 'RECOMMANDATION']);
    variantes.forEach(v => {
      const mesures = STATE.getMesuresParVariante(v.id);
      const sub = subRes[v.id];
      rows.push([v.id, v.denomination||'', mesures.map(m=>m.abrev).join(', '), sub?.total_retenu||0, sub?.recommande||'']);
    });
    if(d.conseil_ia?.texte){rows.push(['','']);rows.push(['CONSEIL IA', d.conseil_ia.texte]);}
    this.downloadXLS(rows, 'CECB_Resume_' + (d.projet.nom||'Export'));
    UI.toast('Resume comparatif genere', 'success');
  },

  downloadXLS(rows, filename) {
    let html = '<table>';
    rows.forEach(row => {
      html += '<tr>' + (Array.isArray(row)?row:[row]).map(cell => '<td>' + (cell||'') + '</td>').join('') + '</tr>';
    });
    html += '</table>';
    const blob = new Blob(
      ['<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body>' + html + '</body></html>'],
      { type: 'application/vnd.ms-excel' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/[^a-zA-Z0-9_-]/g, '_') + '.xls';
    a.click();
    URL.revokeObjectURL(url);
  },

  imprimer() {
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier', 'error'); return; }
    const vtab = document.getElementById('subventions-tableau');
    const html = '<!DOCTYPE html><html><head><meta charset="UTF8"><style>body{font-family:Arial;font-size:11pt;padding:20px}h1{font-size:14pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px}th{background:#e8e8e8}</style></head><body><h1>CECB Plus - ' + (d.projet.nom||'') + ' - ' + (d.projet.localite||'') + '</h1><p>SRE : ' + (d.projet.sre||'') + ' m2</p>' + (vtab?.innerHTML||'') + '<p>Conseil IA : ' + (d.conseil_ia?.texte||'') + '</p></body></html>';
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(html);
    win.document.close();
  },
};

window.EXPORT = EXPORT;
