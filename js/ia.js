/**
 * ia.js — Intégration API Claude (Anthropic)
 * Génération des textes officiels CECB / CECB+
 */

const IA = {
  apiKey: CONFIG.anthropic_key || '',

  async genererTextesCECB() {
    if (!this.apiKey) { this.showCleAPIModal(); return; }
    const d = STATE.dossier;
    if (!d) { UI.toast('Aucun dossier ouvert', 'error'); return; }

    UI.showIAModal('Génération des textes CECB en cours...');

    const elements = d.elements || [];
    const prompt = `Tu es un expert CECB certifié suisse. Genère les textes officiels pour le portail CECB www.cecb-tool.ch.

DONNÉES DU BÂTIMENT :
Année construction : ${d."projet"."annee_construction"}
Chauffage : ${d.technique.type_chauffage} | ${d.technique.agent_energetique}
Ventilation : ${d.technique.type_ventilation}
Composition : ${elements.map(el => el.abrev + ' (' + el.composition + ') ' + 'U=' + (el.u_mesure||'�')).join(', ')}

Genère un objet JSON avec ces clés exactes, textes style officiel CECB (150-300 car.) :
{"toits":"...","murs":"...","fenetres":"...","sols":"...","ponts_thermiques":"...","chauffage":"...","ecs":"...","ventilation":"...","appareils":"..."}

Répons uniquement avec le JSON, sans texte avant ou après.`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20050514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const textes = JSON.parse(clean);
      STATE.dossier.textes_cecb = textes;
      BUREAU.afficherTextes();
      UI.toast('Textes CECB générés ✓', 'success');
    } catch(e) {
      console.error('IA error:', e);
      UI.toast('Erreur API Claude: ' + e.message, 'error');
    } finally {
      UI.hideIAModal();
    }
  },

  async genererTextesVariante(lettre) {
    if (!this.apiKey) { this.showCleAPIModal(); return; }
    const variante = STATE.getVariante(lettre);
    if (!variante) return;

    UI.showIAModal(`Génération textes Variante ${lettre}...`);

    const mesures = STATE.getMesuresParVariante(lettre);
    const d = STATE.dossier;
    const prompt = `Tu es un expert CECB+ certifiié suisse (Daniel Gachoud, Frilow Sàrl).
Génère les 15 textes officiels pour le portail cecb-tool.ch, style officiel CECB (MAX 4000 car. par texte).

VARIANTE ${lettre} : ${variante.denomination}
MESUREQ : ${mesures.map(m => m.abrev + ' ' + m.denomination + ' U:' + (m.u_cible||'')).join(', ')}
CHAUFFAGE ACTUEL : ${d.technique.type_chauffage}
ANNÉE CONSTRUCTION : ${d.projet.annee_construction}

Répons JSON uniquement :
{"enveloppe_general":"...","toits":"...","autres_plafonds":"...","fenetres":"...","murs_ext":"...","autres_murs":"...","sols_ext":"...","autres_sols":"...","ponts_thermiques":"...","technique_general":"...","chauffage":"...","distribution_ecs":"...","electricite":"...","ventilation":"..."}`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const textes = JSON.parse(clean);
      STATE.updateVariante(lettre, { textes });
      VARIANTES.rafraichirVariante(lettre);
      UI.toast(`Textes Variante ${lettre} générés ✓ �'success');
    } catch(e) {
      console.error('IA error:', e);
      UI.toast('Erreur API Claude: ' + e.message, 'error');
    } finally {
      UI.hideIAModal();
    }
  },

  async genererToutesVariantes() {
    if (!this.apiKey) { this.showCleAPIModal(); return; }
    const variantes = STATE.dossier?.variantes || [];
    for (const v of variantes) {
      await this.genererTextesVariante(v.id);
      await new Promise(r => setTimeout(r, 1000));
    }
    UI.toast('Toutes les variantes générées ✓ �'success');
  },

  async genererConseil() {
    if (!this.apiKey) { this.showCleAPIModal(); return; }
    const d = STATE.dossier;
    if (!d) return;

    UI.showIAModal('Génération du conseil IA...');

    const sub = d.subventions?.par_variante || {};
    const summary = Object.entries(sub).map(([lettre, r]) =>
      `Variante ${lettre} : subventions estimées ${r.total_retenu CHF (${r.recommande})`
    ).join('\n');

    const prompt = `POUR LE PROPRI%TTAIE :
    SRE = ${d.projet.sre} m2, Affectation = ${d.projet.affectation}
    Chauffage actuel : ${d.technique.type_chauffage} - ${d.technique.agent_energetique}
    Subventions :\n${summary}
    En quelques phrases, quelle variante recommandes-tu et pourquoi ? Style expert indépendant, Familiari, langue française.`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await resp.json();
      const texte = data.content?.[0]?.text || '';
      STATE.dossier.conseil_ia = { texte, genere_le: new Date().toISOString() };
      const container = document.getElementById('ia-conseil-resultat');
      if (container) container.innerText = texte;
      UI.toast('Conseil IA généré ✓', 'success');
    } catch(e) {
      UI.toast('Erreur API: ' + e.message, 'error');
    } finally {
      UI.hideIAModal();
    }
  },

  showCleAPIModal() {
    const cle = window.prompt('Entrez la clé API Anthropic :');
    if (cle) {
      this.apiKey = cle;
      CONFIG.anthropic_key = cle;
      UI.toast('Clé API sauvegardée ✓', 'success');
    }
  },
};

window.IA = IA;
