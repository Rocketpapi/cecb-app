/**
 * subventions_cantons.js - Données officielles subventions CECB par canton
 * Source principale: cecb.ch tableau janvier 2026 (mis à jour 2x/an)
 * Sources secondaires: sites cantonaux officiels (fr.ch, vd.ch, ge.ch, etc.)
 * Lien officiel par canton: fourni dans chaque objet
 * IMPORTANT: Les montants varient. Toujours vérifier sur leprogrammebatiments.ch
 */

// ─── Détection canton par NPA ─────────────────────────────────────────
const NPA_CANTON = {
  detecter(npa) {
    const n = parseInt(npa);
    if (!n) return null;
    // Genève
    if (n >= 1200 && n <= 1299) return 'GE';
    // Vaud
    if (n >= 1000 && n <= 1199) return 'VD';
    if (n >= 1300 && n <= 1545) return 'VD';
    if (n >= 1800 && n <= 1899) return 'VD';
    if (n >= 1400 && n <= 1430) return 'VD';
    // Fribourg
    if (n >= 1546 && n <= 1799) return 'FR';
    if (n >= 3175 && n <= 3215) return 'FR'; // Sensebezirk
    // Valais
    if (n >= 1870 && n <= 1999) return 'VS';
    if (n >= 3900 && n <= 3999) return 'VS';
    // Jura
    if (n >= 2800 && n <= 2999) return 'JU';
    // Neuchâtel
    if (n >= 2000 && n <= 2799) return 'NE';
    // Berne
    if (n >= 2500 && n <= 2579) return 'BE';
    if (n >= 3000 && n <= 3899) return 'BE';
    if (n >= 4500 && n <= 4579) return 'BE';
    // Soleure
    if (n >= 4500 && n <= 4599) return 'SO';
    // Bâle-Ville
    if (n >= 4000 && n <= 4059) return 'BS';
    // Bâle-Campagne
    if (n >= 4100 && n <= 4499) return 'BL';
    // Argovie
    if (n >= 4600 && n <= 5799) return 'AG';
    if (n >= 8910 && n <= 8919) return 'AG';
    // Zurich
    if (n >= 8000 && n <= 8499) return 'ZH';
    if (n >= 8700 && n <= 8909) return 'ZH';
    // Thurgovie
    if (n >= 8500 && n <= 8599) return 'TG';
    if (n >= 8280 && n <= 8299) return 'TG';
    // Schaffhouse
    if (n >= 8200 && n <= 8280) return 'SH';
    // Saint-Gall
    if (n >= 9000 && n <= 9499) return 'SG';
    // Appenzell
    if (n >= 9050 && n <= 9108) return 'AI';
    if (n >= 9400 && n <= 9499) return 'AR';
    // Grisons
    if (n >= 7000 && n <= 7999) return 'GR';
    // Tessin
    if (n >= 6500 && n <= 6999) return 'TI';
    // Lucerne
    if (n >= 6000 && n <= 6299) return 'LU';
    // Obwald/Nidwald
    if (n >= 6060 && n <= 6090) return 'OW';
    if (n >= 6370 && n <= 6390) return 'NW';
    // Uri
    if (n >= 6460 && n <= 6490) return 'UR';
    // Schwyz
    if (n >= 6400 && n <= 6465) return 'SZ';
    // Zoug
    if (n >= 6300 && n <= 6370) return 'ZG';
    // Glaris
    if (n >= 8750 && n <= 8775) return 'GL';
    return null;
  }
};

// ─── Données subventions par canton ──────────────────────────────────
// Structure: pour chaque canton:
//   cecb_plus: subvention pour établir le CECB Plus
//   amelioration_classe: subvention par amélioration de classe CECB (CHF/m² SRE)
//   renovation_totale: subvention pour rénovation totale (CHF/m² SRE)
//   lien: URL officielle
//   portail: portail de demande
//   note: conditions particulières

const SUBVENTIONS_CANTONS = {

  AG: {
    nom: 'Argovie', abrev: 'AG',
    lien: 'https://www.ag.ch/de/themen/umwelt-natur/energie/foerderung',
    portail: 'portal.leprogrammebatiments.ch/ag',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH 1000, MFH/autres 1500' },
    amelioration_classe: null,
    renovation_totale: null,
    nouveau_batiment: null,
    note: '',
  },

  AI: {
    nom: 'Appenzell Rhodes-Intérieures', abrev: 'AI',
    lien: 'https://www.ai.ch/themen/planen-und-bauen/energie/foerderprogramme/gebaeudesanierung',
    portail: 'portal.leprogrammebatiments.ch/ai',
    cecb_plus: null,
    amelioration_classe: {
      note: 'Rénovation toutes surfaces principales: 30 CHF/m² surface élément rénové. Enveloppe CECB C: 30/m², CECB B: 40/m²',
      calcul: (delta, type, sre) => Math.round(sre * (delta >= 2 ? 35 : 30)),
    },
    renovation_totale: {
      note: 'Entre 60 et 140 CHF/m² SRE selon enveloppe, efficacité globale et type bâtiment',
      calcul: (type, sre) => Math.round(sre * (type === 'hab_ind' ? 100 : 80)),
    },
    nouveau_batiment: {
      note: 'CECB A/A: EFH 65/m² SRE, Hab. coll. 35/m² SRE, Non-résidentiel 25/m² SRE',
    },
    note: '',
  },

  AR: {
    nom: 'Appenzell Rhodes-Extérieures', abrev: 'AR',
    lien: 'https://ar.ch/verwaltung/departement-bau-und-volkswirtschaft/amt-fuer-umwelt/energie/foerderung/kantonale-foerderung/',
    portail: 'portal.leprogrammebatiments.ch/ar',
    cecb_plus: null, amelioration_classe: null, renovation_totale: null, nouveau_batiment: null,
    note: 'Consulter le site cantonal pour les montants actuels',
  },

  BE: {
    nom: 'Berne', abrev: 'BE',
    lien: 'https://www.weu.be.ch/de/start/themen/energie/foerderprogramm-energie/foerderbeitraege-bedingungen.html',
    portail: 'portal.leprogrammebatiments.ch/be',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, autres 1500' },
    amelioration_classe: {
      note: 'Entre 40 et 160 CHF/m² SRE selon nombre classes et catégorie bâtiment. Bonus enveloppe: CECB A 70/m², B 50/m², C 30/m²',
      calcul: (delta, type, sre) => {
        const t = { 2:40, 3:60, 4:80, 5:110, 6:160 }[Math.min(delta,6)] || 40;
        return Math.round(sre * t);
      },
    },
    renovation_totale: null,
    nouveau_batiment: null,
    note: '',
  },

  BL: {
    nom: 'Bâle-Campagne', abrev: 'BL',
    lien: 'https://www.energiepaket-bl.ch/was-wird-gefoerdert/uebersicht-foerderbeitraege',
    portail: 'portal.leprogrammebatiments.ch/bl',
    cecb_plus: { note: '50% des coûts', calcul: () => null },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null,
    note: '50% des coûts du CECB Plus pris en charge',
  },

  BS: {
    nom: 'Bâle-Ville', abrev: 'BS',
    lien: 'https://www.bs.ch/wsu/aue/abteilung-energie/foerderbeitraege-energie',
    portail: 'portal.leprogrammebatiments.ch/bs',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH 1000, autres 1500. Action spéciale 500 CHF (5000 rapports)' },
    amelioration_classe: null,
    renovation_totale: {
      note: 'Classe CECB C: 30/m² SRE, B: 40/m² SRE, A: 50/m² SRE',
      calcul: (type, sre, classe) => Math.round(sre * ({ C:30, B:40, A:50 }[classe] || 30)),
    },
    nouveau_batiment: null,
    note: '',
  },

  FR: {
    nom: 'Fribourg', abrev: 'FR',
    lien: 'https://www.fr.ch/deef/sde/programmes-de-subventions-en-matiere-denergie',
    portail: 'portal.leprogrammebatiments.ch/fr',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH 1000, autres 1500. Réduction de ce montant sur M-01 si CECB+ déjà subventionné l'année précédente' },
    // M-01 isolation: 50 CHF/m², IP-14 bonus global: +60 CHF/m²
    isolation_m01: { taux: 50, bonus_ip14: 60, note: 'M-01: 50 CHF/m². IP-14 bonus assainissement global (≥90% surfaces): +60 CHF/m². U≤0.20 W/m²K (0.25 murs enterrés). Avant 2000. CECB+ dès 10k CHF.' },
    amelioration_classe: {
      note: 'Entre 30 et 180 CHF/m² SRE selon nombre classes et catégorie. Bonus IP-14: 30 CHF/m² SRE si enveloppe CECB B ou C',
      calcul: (delta, type, sre) => {
        const idx = type === 'hab_ind' ? 0 : type === 'hab_coll' ? 1 : 2;
        const taux = [[30,30,20],[45,50,30],[60,70,45],[80,95,60],[100,120,75],[120,145,90]][Math.min(delta-2,5)];
        return Math.round(sre * (taux ? taux[idx] : 30));
      },
    },
    renovation_totale: null,
    nouveau_batiment: null,
    note: 'Obligation de CECB lors de changement de propriétaire',
    pac: {
      air_eau: { base: 3500, par_kw: 150, ecs: 1000, note: 'PAC air/eau ≤70kW: 3500+150/kW+1000 ECS' },
      saumure: { base: 5000, par_kw: 300, ecs: 1000, note: 'PAC saumure/eau ≤70kW: 5000+300/kW+1000 ECS' },
      cad: { base: 5000, par_kw: 30, note: 'Raccordement CAD: 5000+30/kW' },
    },
  },

  GE: {
    nom: 'Genève', abrev: 'GE',
    lien: 'https://www.ge.ch/energie-aides-financieres/subvention-energie-batiments',
    portail: 'ge.ch/amenager/subventions',
    cecb_plus: { note: '< 500m² SRE: 750 CHF. > 500m² SRE: 1500 CHF' },
    amelioration_classe: {
      note: 'Entre 60 et 390 CHF/m² SRE. Le plus généreux de Suisse romande. CECB+ obligatoire dès 10k CHF.',
      calcul: (delta, type, sre) => {
        const taux = {
          hab_ind:  { 2:80,  3:120, 4:170, 5:230, 6:310 },
          hab_coll: { 2:60,  3:95,  4:140, 5:195, 6:260 },
          autre:    { 2:40,  3:65,  4:100, 5:140, 6:190 },
        }[type] || { 2:60, 3:95, 4:140, 5:195, 6:260 };
        return Math.round(sre * (taux[Math.min(delta,6)] || 60));
      },
    },
    renovation_totale: {
      note: 'HPE Hab.ind.: 390/m², Hab.coll.: 210/m², Autres: 150/m². THPE Hab.ind.: 470/m², Hab.coll.: 270/m², Autres: 190/m²',
      calcul: (type, sre, standard) => {
        const t = standard === 'THPE'
          ? { hab_ind:470, hab_coll:270, autre:190 }
          : { hab_ind:390, hab_coll:210, autre:150 };
        return Math.round(sre * (t[type] || t.hab_coll));
      },
    },
    nouveau_batiment: {
      note: 'CECB A/A: Hab.ind. 75/m², Hab.coll. 40/m², Autres 30/m²',
    },
    note: 'Mazout interdit nouvelles installations GE depuis 2022. Demande 14j avant début travaux. 24 mois pour réaliser.',
  },

  GL: {
    nom: 'Glaris', abrev: 'GL',
    lien: 'https://www.gl.ch/verwaltung/bau-und-umwelt/umwelt-wald-und-energie/umweltschutz-und-energie/energie/foerderprogramm.html/773',
    portail: 'portal.leprogrammebatiments.ch/gl',
    cecb_plus: { hab_ind: 1200, hab_coll: 1200, note: 'EFH/ZFH/MFH: 1200 CHF' },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },

  GR: {
    nom: 'Grisons', abrev: 'GR',
    lien: 'https://www.gr.ch/DE/institutionen/verwaltung/diem/aev/foerderprogramme/Seiten/default.aspx',
    portail: 'portal.leprogrammebatiments.ch/gr',
    cecb_plus: null, amelioration_classe: null, renovation_totale: null, nouveau_batiment: null,
    note: 'Consulter le site cantonal pour les montants actuels',
  },

  JU: {
    nom: 'Jura', abrev: 'JU',
    lien: 'https://www.jura.ch/DEN/SDT/Energie/Subventions/Programme-Batiments-1/Programme-Batiments.html',
    portail: 'portal.leprogrammebatiments.ch/ju',
    cecb_plus: null,
    amelioration_classe: {
      note: 'Selon la classe: 30 à 40 CHF/m² SRE. Max 100k CHF/bâtiment. Min 3000 CHF.',
      calcul: (delta, type, sre) => Math.round(sre * (delta >= 3 ? 40 : 30)),
    },
    renovation_totale: null, nouveau_batiment: null,
    note: 'Max 100000 CHF par bâtiment. Min 3000 CHF par demande.',
  },

  LU: {
    nom: 'Lucerne', abrev: 'LU',
    lien: 'https://uwe.lu.ch/themen/energie/Foerderprogramme',
    portail: 'portal.leprogrammebatiments.ch/lu',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, autres 1500' },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },

  NE: {
    nom: 'Neuchâtel', abrev: 'NE',
    lien: 'https://www.ne.ch/autorites/DDTE/SENE/energie/Pages/subventions.aspx',
    portail: 'portal.leprogrammebatiments.ch/ne',
    cecb_plus: null,
    amelioration_classe: {
      note: 'Entre 50 et 155 CHF/m² SRE selon nombre classes et catégorie bâtiment',
      calcul: (delta, type, sre) => {
        const t = { 2:50, 3:75, 4:100, 5:130, 6:155 }[Math.min(delta,6)] || 50;
        return Math.round(sre * t);
      },
    },
    renovation_totale: null, nouveau_batiment: null,
    note: 'Obligation CECB dans certaines conditions lors changement propriétaire',
  },

  NW: {
    nom: 'Nidwald', abrev: 'NW',
    lien: 'https://www.energie-zentralschweiz.ch/foerderprogramme/nidwalden.html',
    portail: 'portal.leprogrammebatiments.ch/nw',
    cecb_plus: { hab_ind: 1500, hab_coll: 1500, note: 'Toutes catégories: 1500 CHF' },
    amelioration_classe: null,
    renovation_totale: null,
    nouveau_batiment: {
      note: 'CECB A/A: Hab.ind. 75/m² SRE, Hab.coll. 40/m² SRE, Non-résidentiel 30/m² SRE',
    },
    note: '',
  },

  OW: {
    nom: 'Obwald', abrev: 'OW',
    lien: 'https://www.ow.ch/publikationen/37267',
    portail: 'portal.leprogrammebatiments.ch/ow',
    cecb_plus: null, amelioration_classe: null, renovation_totale: null, nouveau_batiment: null,
    note: 'Consulter le site cantonal',
  },

  SG: {
    nom: 'Saint-Gall', abrev: 'SG',
    lien: 'https://www.energieagentur-sg.ch/waermedaemmung-einzelbauteile',
    portail: 'portal.leprogrammebatiments.ch/sg',
    cecb_plus: null,
    amelioration_classe: {
      note: 'Classe CECB C: 30/m² SRE. Classe CECB B ou A: 40/m² SRE',
      calcul: (delta, type, sre, classeApres) => Math.round(sre * (classeApres === 'A' || classeApres === 'B' ? 40 : 30)),
    },
    renovation_totale: null, nouveau_batiment: null, note: '',
  },

  SH: {
    nom: 'Schaffhouse', abrev: 'SH',
    lien: 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Behoerde/Verwaltung/Baudepartement/Departementssekretariat-Baudepartement/Energiefachstelle/Foerderprogramm-1566144-DE.html',
    portail: 'portal.leprogrammebatiments.ch/sh',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, MFH 1500, autres 2000' },
    amelioration_classe: {
      note: 'Bonus enveloppe: CECB C 40/m² SRE, CECB B 50/m² SRE',
      calcul: (delta, type, sre, classeApres) => Math.round(sre * (classeApres === 'B' ? 50 : 40)),
    },
    renovation_totale: null, nouveau_batiment: null, note: '',
  },

  SO: {
    nom: 'Soleure', abrev: 'SO',
    lien: 'https://energie.so.ch/foerderung/foerdermassnahmen/minergie/',
    portail: 'portal.leprogrammebatiments.ch/so',
    cecb_plus: { note: '50% des coûts, max 1100 CHF (EFH) ou 1800 CHF (autres)', calcul: (type) => type === 'hab_ind' ? 1100 : 1800 },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },

  SZ: {
    nom: 'Schwytz', abrev: 'SZ',
    lien: 'https://www.sz.ch/verwaltung/umweltdepartement/amt-fuer-umwelt-und-energie/energie-und-klima/foerderprogramme.html',
    portail: 'portal.leprogrammebatiments.ch/sz',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, autres 1500' },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },

  TG: {
    nom: 'Thurgovie', abrev: 'TG',
    lien: 'https://energie.tg.ch/hauptrubrik-2/wie-gehe-ich-vor.html/10651',
    portail: 'portal.leprogrammebatiments.ch/tg',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, MFH/hôtel 1500, autres 2000' },
    amelioration_classe: {
      note: 'Selon la classe: 60 à 100 CHF/m² SRE',
      calcul: (delta, type, sre) => Math.round(sre * (delta >= 3 ? 85 : 60)),
    },
    renovation_totale: null, nouveau_batiment: null, note: '',
  },

  TI: {
    nom: 'Tessin', abrev: 'TI',
    lien: 'https://ticinoenergia.ch/it/incentivi/incentivi-federali-e-cantonali.html',
    portail: 'portal.leprogrammebatiments.ch/ti',
    cecb_plus: { note: '500 CHF/évaluation CECB Plus ou 200 CHF/conseil CECB (non cumulables)' },
    amelioration_classe: {
      note: 'Bonus 30/m² pour atteindre classe C ou plus pour enveloppe bâtiment (avec aide base)',
    },
    renovation_totale: {
      note: 'Bâtiments rénovés certifiés CECB B/B: 140% aide base (60/m² éléments). CECB A/B: 160%',
    },
    nouveau_batiment: null, note: '',
  },

  UR: {
    nom: 'Uri', abrev: 'UR',
    lien: 'https://www.ur.ch/energie/1522',
    portail: 'portal.leprogrammebatiments.ch/ur',
    cecb_plus: null,
    amelioration_classe: null,
    renovation_totale: {
      note: 'CECB enveloppe A/B/C: 30 CHF/m² SRE',
      calcul: (type, sre) => Math.round(sre * 30),
    },
    nouveau_batiment: null, note: '',
  },

  VD: {
    nom: 'Vaud', abrev: 'VD',
    lien: 'https://www.vd.ch/environnement/energie/subventions-programme-batiments',
    portail: 'portal.leprogrammebatiments.ch/vd',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH 1000, autres 1500' },
    isolation_m01: { taux: 50, note: 'M-01: 50 CHF/m². Bonus PV couplé possible. U≤0.20. Avant 2000. CECB+ dès 10k CHF. Min 3000 CHF.' },
    amelioration_classe: {
      note: 'Entre 20 et 155 CHF/m² SRE selon nombre classes et catégorie',
      calcul: (delta, type, sre) => {
        const taux = {
          hab_ind:  { 2:30, 3:50, 4:75, 5:100, 6:130 },
          hab_coll: { 2:20, 3:35, 4:55, 5:75,  6:100 },
          autre:    { 2:15, 3:25, 4:40, 5:55,  6:75  },
        }[type] || { 2:20, 3:35, 4:55, 5:75, 6:100 };
        return Math.round(sre * (taux[Math.min(delta,6)] || 20));
      },
    },
    renovation_totale: {
      note: 'CECB C/B: Hab.ind. 90/m², Hab.coll. 50/m², Autres 35/m². CECB B/A: Hab.ind. 140/m², Hab.coll. 80/m², Autres 60/m²',
      calcul: (type, sre, classe) => {
        const t = classe === 'B/A'
          ? { hab_ind:140, hab_coll:80, autre:60 }
          : { hab_ind:90, hab_coll:50, autre:35 };
        return Math.round(sre * (t[type] || t.hab_coll));
      },
    },
    nouveau_batiment: null,
    note: 'Obligation CECB lors changement propriétaire',
    pac: {
      air_eau: { note: 'M-05/IP-05 selon puissance ≤70kW ou >70kW' },
      saumure: { note: 'M-06/IP-06' },
    },
  },

  VS: {
    nom: 'Valais', abrev: 'VS',
    lien: 'https://www.vs.ch/de/web/energie/finanzhilfe-energiebereich',
    portail: 'portal.leprogrammebatiments.ch/vs',
    cecb_plus: null,
    amelioration_classe: {
      note: 'Entre 15 et 260 CHF/m² SRE selon nombre classes et catégorie bâtiment',
      calcul: (delta, type, sre) => {
        const taux = {
          hab_ind:  { 2:20, 3:35, 4:55, 5:80,  6:110 },
          hab_coll: { 2:15, 3:30, 4:50, 5:70,  6:100 },
        }[type] || { 2:15, 3:30, 4:50, 5:70, 6:100 };
        return Math.round(sre * (taux[Math.min(delta,6)] || 15));
      },
    },
    renovation_totale: null,
    nouveau_batiment: {
      note: 'CECB A/A: Hab.ind. 150/m² SRE, Hab.coll. 150/m² SRE, Autres 60/m² SRE',
    },
    note: '',
  },

  ZG: {
    nom: 'Zoug', abrev: 'ZG',
    lien: 'https://www.energie-zentralschweiz.ch/foerderprogramme/zug.html',
    portail: 'portal.leprogrammebatiments.ch/zg',
    cecb_plus: { hab_ind: 1500, hab_coll: 1500, note: 'Toutes catégories: 1500 CHF' },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },

  ZH: {
    nom: 'Zurich', abrev: 'ZH',
    lien: 'https://www.zh.ch/de/umwelt-tiere/energie/energiefoerderung.html',
    portail: 'portal.leprogrammebatiments.ch/zh',
    cecb_plus: { hab_ind: 1000, hab_coll: 1500, note: 'EFH/ZFH 1000, autres 1500' },
    amelioration_classe: null, renovation_totale: null, nouveau_batiment: null, note: '',
  },
};

// ─── Fonctions utilitaires ─────────────────────────────────────────────
function getSubventionsCanton(canton) {
  return SUBVENTIONS_CANTONS[canton] || null;
}

function getCantonParNPA(npa) {
  return NPA_CANTON.detecter(npa);
}

// Integration CONFIG
if (typeof CONFIG !== 'undefined') {
  CONFIG.subventions_par_canton = SUBVENTIONS_CANTONS;
  CONFIG.npa_canton = NPA_CANTON;
  CONFIG.getSubventionsCanton = getSubventionsCanton;
  CONFIG.getCantonParNPA = getCantonParNPA;
}
