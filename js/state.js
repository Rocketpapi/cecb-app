const STATE = {
  dossier: null,
  _dirty: false,
  _listeners: [],

  nouveau() {
    this.dossier = {
      version: CONFIG.version,
      cree_le: new Date().toISOString(),
      modifie_le: new Date().toISOString(),
      projet: {
        nom:'', mandant:'', adresse:'', npa:'', localite:'',
        canton:'FR', affectation:'hab_coll',
        annee_construction:'', nb_etages:'', sre:'', nb_apparts:'',
        type_mandat:'cecb_plus', notes:'',
        egid:'', egrid:''
      },
      terrain: {
        date_visite:'', experts:'Daniel Gachoud', observations:'',
        docs:{plans:false,facades:false,coupes:false,conso_elec:false,conso_ch:false,offre_pac:false}
      },
      elements: [],
      terrain_enveloppe: {},
      technique: {
        type_chauffage:'', marque_chauffage:'', annee_chauffage:'',
        puissance_kw:'', agent_energetique:'gaz',
        distribution_chauffage:'plancher', retour_ecs:'',
        type_ecs:'ballon_lie', volume_ecs_l:'', annee_ecs:'',
        type_ventilation:'naturelle', pv_existant:'non', pv_kwp:'',
        photo_plaque:null
      },
      conso: { gaz_kwh:'', mazout_l:'', elec_kwh:'', bois_kwh:'', cad_kwh:'' },
      textes_cecb: {},
      mesures: [],
      variantes: [],
    };
    this._dirty = false;
    this._notify('all');
  },

  get(path) {
    if (!this.dossier) return null;
    return path.split('.').reduce((o,k) => o && o[k] !== undefined ? o[k] : null, this.dossier);
  },

  set(path, value) {
    if (!this.dossier) return;
    const keys = path.split('.');
    let obj = this.dossier;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length-1]] = value;
    this.dossier.modifie_le = new Date().toISOString();
    this._dirty = true;
    this._notify(path);
  },

  onChange(fn) { this._listeners.push(fn); },

  _notify(path) { this._listeners.forEach(fn => { try { fn(path); } catch(e) {} }); },

  isDirty() { return this._dirty; },

  sauvegarder() {
    if (!this.dossier) return;
    const json = JSON.stringify(this.dossier, null, 2);
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nom = (this.get('projet.nom') || 'dossier-cecb').replace(/[^a-zA-Z0-9-_]/g,'-');
    a.href = url; a.download = nom + '.cecb'; a.click();
    URL.revokeObjectURL(url);
    this._dirty = false;
  },

  async charger(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.dossier = JSON.parse(e.target.result);
          this._dirty = false;
          resolve(this.dossier);
        } catch(err) { reject(err); }
      };
      reader.readAsText(file);
    });
  }
};

window.STATE = STATE;