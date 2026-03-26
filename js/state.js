/**
 * state.js — Gestion de l'état du dossier CECB
 *
 * Le dossier est stocké dans un objet JS en mémoire.
 * Sauvegarde / chargement via fichier .cecb (JSON).
 */

const STATE = {

  dossier: null,

  nouveau() {
    this.dossier = {
      version: CONFIG.version,
      cree_le: new Date().toISOString(),
      modifie_le: new Date().toISOString(),
      projet: { nom:'', mandant:'', adresse:'', npa:'', localite:'', canton:'FR', affectation:'hab_coll', annee_construction:'', nb_etages:'', sre:'', nb_apparts:'', type_mandat:'cecb_plus', notes:'' },
      terrain: { date_visite:'', experts:'Daniel Gachoud', observations:'', docs:{plans:false,facades:false,coupes:false,conso_elec:false,conso_ch:false,offre_pac:false} },
      elements: [],
      technique: { type_chauffage:'', marque_chauffage:'', annee_chauffage:'', puissance_kw:'', agent_energetique:'gaz', distribution_chauffage:'plancher', retour_ecs:'', type_ecs:'ballon_lié', volume_ecs_l:'', annee_ecs:'', type_ventilation:'naturelle', pv_existant:'non', pv_kwp:'', photo_plaque:null },
      conso: { gaz_kwh:'', mazout_l:'', elec_kwh:'', bois_kwh:'', cad_kwh:'' },
      textes_cecb: {}, mesures: [], variantes: [],
      subventions: { par_variante: {}, source:'FR_2025', calcule_le:null },
      conseil_ia: { texte:'', variante_recommandee:'', genere_le:null },
    };
    return this.dossier;
  },

  set(path, value) {
    if (!this.dossier) return;
    const parts = path.split('.');
    let obj = this.dossier;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    this.dossier.modifie_le = new Date().toISOString();
    this._notifyChange(path);
  },

  get(path) {
    if (!this.dossier) return undefined;
    return path.split('.').reduce((obj, k) => obj?.[k], this.dossier);
  },

  addElement(el) { if (!this.dossier) return; const id='el_'+Date.now(); this.dossier.elements.push({id,...el}); this.dossier.modifie_le=new Date().toISOString(); this._notifyChange('elements'); return id; },
  updateElement(id, data) { if (!this.dossier) return; const idx=this.dossier.elements.findIndex(e=>e.id===id); if(idx>=0){this.dossier.elements[idx]={...this.dossier.elements[idx],...data};this.dossier.modifie_le=new Date().toISOString();this._notifyChange('elements');} },
  deleteElement(id) { if (!this.dossier) return; this.dossier.elements=this.dossier.elements.filter(e=>e.id!==id); this.dossier.mesures=this.dossier.mesures.filter(m=>m.element_id!==id); this.dossier.modifie_le=new Date().toISOString(); this._notifyChange('elements'); },
  addMesure(m) { if (!this.dossier) return; const id='mes_'+Date.now(); this.dossier.mesures.push({id,variantes:{A:false,B:false,C:false,D:false},maintien_valeur:true,facteur_difficulte:1,...m}); this.dossier.modifie_le=new Date().toISOString(); this._notifyChange('mesures'); return id; },
  updateMesure(id, data) { if (!this.dossier) return; const idx=this.dossier.mesures.findIndex(m=>m.id===id); if(idx>=0){this.dossier.mesures[idx]={...this.dossier.mesures[idx],...data};this.dossier.modifie_le=new Date().toISOString();this._notifyChange('mesures');} },
  deleteMesure(id) { if (!this.dossier) return; this.dossier.mesures=this.dossier.mesures.filter(m=>m.id!==id); this.dossier.modifie_le=new Date().toISOString(); this._notifyChange('mesures'); },

  initVariantes() {
    if (!this.dossier) return;
    if (this.dossier.variantes.length === 0) {
      ['A','B','C','D'].forEach(l => {
        this.dossier.variantes.push({id:l,denomination:'',duree_travaux:'non défini',description:'',
          donnees_batiment:{annee_renovation:new Date().getFullYear(),type_construction:'massive',type_plan:'allongé',hauteur_pieces:'',nb_etages:this.get('projet.nb_etages')||'',largeur:''},
          affectations:[{type:this.get('projet.affectation')||'hab_coll',sre:this.get('projet.sre')||''}],
          textes:{enveloppe_general:'',toits:',autres_plafonds:'',fenetres:'',murs_ext:'',autres_murs:'',sols_ext:'',autres_sols:'',ponts_thermiques:',technique_general:'',chauffage:'',distribution_ecs:',electricite:',ventilation:'}}});
      });
      this.dossier.modifie_le=new Date().toISOString();
    }
  },

  updateVariante(id,data) { if(!this.dossier)return; const idx=this.dossier.variantes.findIndex(v=>v.id===id); if(idx>=0){this.dossier.variantes[idx]={...this.dossier.variantes[idx],...data};this.dossier.modifie_le=new Date().toISOString();this._notifyChange('variantes');} },

  sauvegarder() {
    if(!this.dossier){UI.toast('Aucun dossier ouvert','error');return;}
    this.dossier.modifie_le=new Date().toISOString();
    const json=JSON.stringify(this.dossier,null,2);
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const nom=this.dossier.projet.nom?this.dossier.projet.nom.replace(/[^a-zA-Z0-9_\-]/g,'_'):'dossier_cecb';
    a.href=url;a.download=nom+'.cecb';a.click();URL.revokeObjectURL(url);
    UI.toast('Dossier sauvegardé ✓','success');
  },

  charger(file) {
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=(e)=>{try{const data=JSON.parse(e.target.result);this.dossier=data;this._notifyChange('all');UI.toast('Dossier chargé ✓''success');resolve(data);}catch(err){UI.toast('Erreur: fichier invalide','error');reject(err);}};
      reader.onerror=reject;reader.readAsText(file);
    });
  },

  _listeners:[],
  onChange(fn){this._listeners.push(fn);},
  _notifyChange(path){this._listeners.forEach(fn=>{try{fn(path);}catch(e){console.error('STATE ex',e);}});},

  getMesuresParVariante(l){return(this.dossier?.mesures||[]).filter(m=>m.variantes?.[l]);},
  getVariante(id){return(this.dossier?.variantes||[]).find(v=>v.id===id);},
  getElement(id){return(this.dossier?.elements||[]).find(e=>e.id===id);},
  isDirty(){return this.dossier!==null;},
};
