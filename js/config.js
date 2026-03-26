const CONFIG = {
  version: "1.0.0",
  apiKey: "VOTRE_CLE_API",
  sia380: {
    limites_renovation: { opaquesExt: 0.25, fenetresExt: 1.00 },
    cibles: { opaquesReno: 0.10, fenetresReno: 0.80 }
  },
  u_etat_initial: {
    avant_1945:   { toiture: 1.20, murs: 1.50, fenetres: 5.0, sol: 1.00 },
    de_1945_1960: { toiture: 0.80, murs: 1.20, fenetres: 3.5, sol: 0.80 },
    de_1961_1975: { toiture: 0.60, murs: 1.00, fenetres: 3.0, sol: 0.70 },
    de_1976_1990: { toiture: 0.40, murs: 0.60, fenetres: 2.8, sol: 0.55 },
    de_1991_2000: { toiture: 0.30, murs: 0.40, fenetres: 2.0, sol: 0.45 },
    de_2001_2010: { toiture: 0.22, murs: 0.28, fenetres: 1.4, sol: 0.35 },
    apres_2010:   { toiture: 0.17, murs: 0.22, fenetres: 1.1, sol: 0.28 }
  },
  types_elements: [
    { id: "toiture",   label: "Toits et plafonds",      icon: "🏠", categorie: "enveloppe" },
    { id: "murs",      label: "Murs exterieurs",         icon: "🧱", categorie: "enveloppe" },
    { id: "fenetres",  label: "Fenetres et portes",      icon: "🪟", categorie: "enveloppe" },
    { id: "sol",       label: "Sols / planchers",        icon: "⬛", categorie: "enveloppe" },
    { id: "ponts",     label: "Ponts thermiques",        icon: "⚠️", categorie: "enveloppe" },
    { id: "chauffage", label: "Chauffage",               icon: "🔥", categorie: "technique" },
    { id: "ecs",       label: "Eau chaude sanitaire",    icon: "💧", categorie: "technique" },
    { id: "ventil",    label: "Ventilation",             icon: "💨", categorie: "technique" },
    { id: "elec",      label: "Electricite / PV",        icon: "⚡", categorie: "technique" }
  ],
  etats: [
    { value: "neuf",    label: "Neuf",           color: "#22c55e" },
    { value: "bon",     label: "Bon etat",       color: "#84cc16" },
    { value: "use",     label: "Use",            color: "#f59e0b" },
    { value: "abime",   label: "Abime",          color: "#f97316" },
    { value: "fin_vie", label: "Fin de vie",     color: "#ef4444" }
  ],
  subventions_FR: {
    canton: "FR", annee: 2025,
    cecb_plus: { hab_ind: 1000, autres: 1500 },
    variante1: {
      M01: { taux_chf_m2: 50 },
      M05: { forfait: 3500, par_kw: 150, ecs: 1000 },
      M06: { forfait: 5000, par_kw: 300, ecs: 1000 },
      M07: { forfait: 5000, par_kw: 30 }
    },
    variante2: {
      M10: {
        hab_ind:  { 2:30, 3:45, 4:60, 5:80, 6:100, 7:120, 8:140, 9:160, 10:180 },
        hab_coll: { 2:30, 3:40, 4:55, 5:70, 6:90,  7:110, 8:130, 9:150, 10:170 },
        autre:    { 2:20, 3:30, 4:40, 5:55, 6:70,  7:85,  8:100, 9:115, 10:130 }
      },
      bonus_ip14: 30
    }
  },
  versions: { api: "claude-sonnet-4-20250514", max_tokens: 4096, temperature: 0.2 }
};
window.CONFIG = CONFIG;