/**
 * subventions_cantons.js — Données subventions par canton 2025
 * Sources: leprogrammebatiments.ch, sites cantonaux officiels
 * Mise à jour: mars 2026
 */

// Detection canton par NPA
const NPA_CANTON = {
  detecter(npa) {
    const n = parseInt(npa);
    if (!n) return null;
    if (n >= 1200 && n <= 1299) return 'GE';
    if (n >= 1000 && n <= 1199) return 'VD';
    if (n >= 1300 && n <= 1545) return 'VD';
    if (n >= 1800 && n <= 1899) return 'VD';
    if (n >= 1546 && n <= 1799) return 'FR';
    if (n >= 1900 && n <= 1999) return 'VS';
    if (n >= 2800 && n <= 2999) return 'JU';
    if (n >= 2300 && n <= 2799) return 'NE';
    if (n >= 3000 && n <= 3999) return 'BE';
    return null;
  }
};

const SUBVENTIONS_CANTONS = {

  // FRIBOURG — fr.ch/deef/sde
  FR: {
    nom: 'Fribourg', annee: 2025,
    portail: 'portal.leprogrammebatiments.ch/fr',
    plafond_par_mesure: 100000, min_par_demande: 1000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01', taux: 50, bonus: 90, min: 1000,
        note: 'U≤0.20 W/m²K, avant 2000, CECB+ dès 10k CHF',
        calcul: (s) => Math.round(s * 50) },
      M05_pac_air: { label: 'PAC air/eau M-05', base: 3500, par_kw: 150, ecs: 1000,
        note: 'Remplacement fossile/élec, ≤70 kW',
        calcul: (kw) => 3500 + kw * 150 + 1000 },
      M06_pac_saumure: { label: 'PAC saumure M-06', base: 5000, par_kw: 300, ecs: 1000,
        calcul: (kw) => 5000 + kw * 300 + 1000 },
      M07_cad: { label: 'CAD M-07', base: 5000, par_kw: 30,
        calcul: (kw) => 5000 + kw * 30 },
    },
    variante2: {
      M10_amelioration: { label: 'Amélioration classe CECB M-10 (hab. collectif)',
        taux: { 2: 50, 3: 60, 4: 80, 5: 100, 6: 120 },
        calcul: (delta, type, sre) => {
          const f = type === 'hab_ind' ? 0.7 : type === 'hab_coll' ? 1.0 : 0.6;
          return Math.round(sre * ({ 2:50, 3:60, 4:80, 5:100, 6:120 }[Math.min(delta,6)]||50) * f);
        }
      },
    },
    complementaires: {
      cecb_plus: { label: 'CECB Plus IM-07',
        calcul: (type) => type === 'hab_ind' ? 1000 : 1500 },
    },
  },

  // VAUD — vd.ch/energie
  VD: {
    nom: 'Vaud', annee: 2025,
    portail: 'portal.leprogrammebatiments.ch/vd',
    plafond_par_mesure: 100000, min_par_demande: 3000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01', taux: 50, bonus: 120, min: 3000,
        note: 'U≤0.20, avant 2000. Bonus si couplé PV. CECB+ dès 10k CHF',
        calcul: (s) => Math.round(s * 50) },
      M05_pac_air: { label: 'PAC air/eau M-05 / IP-05',
        base: 4000, par_kw: 200,
        calcul: (kw) => 4000 + kw * 200 },
      M06_pac_saumure: { label: 'PAC saumure M-06 / IP-06',
        base: 6000, par_kw: 350,
        calcul: (kw) => 6000 + kw * 350 },
      M07_cad: { label: 'CAD M-07', base: 6000, par_kw: 35,
        calcul: (kw) => 6000 + kw * 35 },
    },
    variante2: {
      M10_amelioration: { label: 'Amélioration classe CECB M-10',
        calcul: (delta, type, sre) => {
          const f = type === 'hab_ind' ? 0.75 : 1.0;
          return Math.round(sre * ({ 2:55, 3:65, 4:85, 5:110, 6:130 }[Math.min(delta,6)]||55) * f);
        }
      },
    },
    complementaires: {
      cecb_plus: { label: 'CECB Plus IM-07',
        calcul: (type) => type === 'hab_ind' ? 1200 : 1800 },
    },
  },

  // GENEVE — ge.ch/energie-aides-financieres (le plus genereux SR)
  GE: {
    nom: 'Genève', annee: 2025,
    portail: 'ge.ch/amenager/subventions',
    plafond_par_mesure: 100000, min_par_demande: 1000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01', taux: 60, bonus: 140, min: 1000,
        note: 'U≤0.20 obligatoire. CECB+ obligatoire dès 10k CHF. Jusquà 140 CHF/m2',
        calcul: (s) => Math.round(s * 60) },
      M05_pac_air: { label: 'PAC air/eau', base: 5000, par_kw: 250,
        note: 'Mazout interdit nouvelles installations à GE depuis 2022',
        calcul: (kw) => 5000 + kw * 250 },
      M06_pac_saumure: { label: 'PAC saumure/géothermie', base: 8000, par_kw: 400,
        calcul: (kw) => 8000 + kw * 400 },
      M07_cad: { label: 'CAD', base: 7000, par_kw: 40,
        calcul: (kw) => 7000 + kw * 40 },
    },
    variante2: {
      M10_amelioration: { label: 'Rénovation globale OCEN',
        note: 'Bonus rénovation globale GE, le plus élevé SR',
        calcul: (delta, type, sre) =>
          Math.round(sre * ({ 2:60, 3:75, 4:95, 5:120, 6:145 }[Math.min(delta,6)]||60))
      },
    },
    complementaires: {
      cecb_plus: { label: 'CECB Plus (obligatoire dès 10k)',
        calcul: (type) => type === 'hab_ind' ? 1500 : 2000 },
    },
  },

  // VALAIS — vs.ch/energie
  VS: {
    nom: 'Valais', annee: 2025,
    portail: 'portal.leprogrammebatiments.ch/vs',
    plafond_par_mesure: 100000, min_par_demande: 1000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01', taux: 35, bonus: 50, min: 1000,
        note: 'Bonus +30-40 CHF/m2 si classe C ou supérieure après rénovation',
        calcul: (s) => Math.round(s * 35) },
      M05_pac_air: { label: 'PAC air/eau', base: 4000, par_kw: 180,
        note: 'VS: 8000-12000 CHF selon puissance',
        calcul: (kw) => 4000 + kw * 180 },
      M06_pac_saumure: { label: 'PAC saumure/géothermie', base: 6000, par_kw: 280,
        calcul: (kw) => 6000 + kw * 280 },
      M07_cad: { label: 'CAD', base: 4000, par_kw: 25,
        calcul: (kw) => 4000 + kw * 25 },
    },
    variante2: {
      M10_amelioration: { label: 'Amélioration classe CECB M-10',
        calcul: (delta, type, sre) =>
          Math.round(sre * ({ 2:40, 3:55, 4:70, 5:90, 6:110 }[Math.min(delta,6)]||40))
      },
    },
    complementaires: { cecb_plus: { label: 'CECB Plus', calcul: () => 1000 } },
  },

  // JURA — jura.ch, max 100k CHF/bâtiment, min 3000 CHF
  JU: {
    nom: 'Jura', annee: 2025,
    portail: 'portal.leprogrammebatiments.ch/ju',
    plafond_par_mesure: 100000, min_par_demande: 3000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01', taux: 50, min: 3000,
        note: 'Max 100000 CHF/bâtiment, min 3000 CHF',
        calcul: (s) => Math.round(s * 50) },
      M05_pac_air: { label: 'PAC air/eau M-05', base: 3500, par_kw: 150,
        calcul: (kw) => 3500 + kw * 150 },
      M06_pac_saumure: { label: 'PAC saumure M-06', base: 5000, par_kw: 280,
        calcul: (kw) => 5000 + kw * 280 },
      M07_cad: { label: 'CAD M-07', base: 5000, par_kw: 30,
        calcul: (kw) => 5000 + kw * 30 },
    },
    variante2: {
      M10_amelioration: { label: 'Amélioration classe CECB M-10',
        calcul: (delta, type, sre) =>
          Math.round(sre * ({ 2:50, 3:60, 4:75, 5:95, 6:115 }[Math.min(delta,6)]||50))
      },
    },
    complementaires: { cecb_plus: { label: 'CECB Plus', calcul: () => 1000 } },
  },

  // Cantons non configures: montants approx. Programme Batiments standard
  INCONNU: {
    nom: 'Canton non configuré', annee: 2025,
    portail: 'www.leprogrammebatiments.ch',
    message: 'Canton non configuré. Consultez leprogrammebatiments.ch pour les montants exacts.',
    plafond_par_mesure: 100000, min_par_demande: 1000,
    variante1: {
      M01_isolation: { label: 'Isolation M-01 (estimé)', calcul: (s) => Math.round(s * 45) },
      M05_pac_air:   { label: 'PAC air/eau (estimé)',    calcul: (kw) => 3500 + kw * 150 },
      M06_pac_saumure: { label: 'PAC saumure (estimé)', calcul: (kw) => 5000 + kw * 280 },
      M07_cad:       { label: 'CAD (estimé)',            calcul: (kw) => 5000 + kw * 30 },
    },
    variante2: {
      M10_amelioration: { label: 'Amél. CECB (estimé)',
        calcul: (d, t, sre) => Math.round(sre * ({ 2:50, 3:60, 4:80, 5:100, 6:120 }[Math.min(d,6)]||50)) },
    },
    complementaires: { cecb_plus: { label: 'CECB Plus', calcul: () => 1500 } },
  },
};

// Integration avec CONFIG
if (typeof CONFIG !== 'undefined') {
  CONFIG.subventions_par_canton = SUBVENTIONS_CANTONS;
  CONFIG.npa_canton = NPA_CANTON;
  CONFIG.getSubventionsCanton = (canton) => SUBVENTIONS_CANTONS[canton] || SUBVENTIONS_CANTONS['INCONNU'];
  CONFIG.detecterCanton = (npa) => NPA_CANTON.detecter(npa);
}
