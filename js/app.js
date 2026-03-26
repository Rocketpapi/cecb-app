/**
 * app.js - Frilow CECB App + GeoAdmin auto-fill
 */

const GEOADMIN = {
  CHAUFFAGES:{7410:'Chaudiere mazout',7420:'Chaudiere gaz naturel',7430:'Pompe a chaleur',7440:'Chaudiere bois',7450:'Raccordement CAD',7460:'Chauffage electrique',7480:'Solaire thermique',7499:'Autre'},
  AGENTS_TECH:{7510:'mazout',7511:'gaz',7520:'gaz',7530:'electricite',7560:'pac_air',7570:'pac_saumure',7540:'cad',7501:'bois',7542:'pellets'},
  PERIODES:{8011:'1900',8012:'1932',8013:'1953',8014:'1965',8015:'1975',8016:'1983',8017:'1988',8018:'1993',8019:'1998',8009:'2005',8010:'2015',8021:'2021'},
  CAT_AFF:{1010:'hab_ind',1020:'hab_coll',1021:'hab_coll',1022:'hab_coll',1030:'hab_coll',1040:'bureaux',1060:'bureaux'},
  CHAUF_MAP:{7410:'mazout',7420:'gaz',7430:'pac_air',7440:'bois',7450:'cad',7460:'electrique',7480:'solaire',7499:'autre'},

  async rechercherAdresse(adresse){
    const q=encodeURIComponent(adresse);
    const r1=await fetch('https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText='+q+'&type=locations&origins=address&limit=1&lang=fr');
    const geo=await r1.json();
    const result=geo.results?.[0]?.attrs;
    if(!result) return null;
    const npa=result.label?.match(/\b(\d{4})\b/)?.[1]||'';
    const regblLink=result.links?.find(l=>l.title==='ch.bfs.gebaeude_wohnungs_register');
    if(!regblLink) return {adresse:result.detail?.split(' ').slice(0,-2).join(' ')||'',npa,localite:'',canton:'',affectation:'hab_coll',annee_construction:'',nb_etages:'',nb_logements:'',sre_estime:'',type_chauffage_code:null,agent_code:null,egid:'',egrid:''};
    const r2=await fetch('https://api3.geo.admin.ch'+regblLink.href+'?lang=fr');
    const regbl=await r2.json();
    const a=regbl.feature?.attributes;
    if(!a) return null;
    return {
      adresse:a.strname_deinr||'',npa,localite:a.ggdename||'',canton:a.gdekt||'',
      egid:a.egid||'',egrid:a.egrid||'',
      affectation:this.CAT_AFF[a.gkat]||'hab_coll',
      annee_construction:a.gbauj||this.PERIODES[a.gbaup]||'',
      nb_etages:a.gastw||'',nb_logements:a.ganzwhg||'',surface_sol_m2:a.garea||'',
      sre_estime:a.garea?Math.round(a.garea*(a.gastw||2)*0.85):'',
      type_chauffage_code:a.gwaerzh1,agent_code:a.genh1,
      type_chauffage:this.CHAUFFAGES[a.gwaerzh1]||'',
      agent_energetique:this.AGENTS_TECH[a.genh1]||'',
    };
  },

  set(id,value){
    const el=document.getElementById(id);
    if(!el||value===undefined||value===null||value==='') return;
    el.value=value;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  },

  async remplirFormulaire(adresse){
    UI.toast('Recherche sur map.geo.admin.ch...','info');
    try{
      const d=await this.rechercherAdresse(adresse);
      if(!d){UI.toast('Adresse non trouvee','error');return;}
      this.set('proj-nom',(d.adresse||adresse.split(',')[0])+(d.localite?' - '+d.localite:''));
      this.set('proj-adresse',d.adresse||adresse.split(',')[0]);
      this.set('proj-npa',d.npa);
      this.set('proj-localite',d.localite);
      if(d.egid){this.set('proj-egid',d.egid);STATE.set('projet.egid',d.egid);}
      if(d.egrid){this.set('proj-egrid',d.egrid);STATE.set('projet.egrid',d.egrid);}
      const cantonEl=document.getElementById('proj-canton');
      if(cantonEl&&d.canton){const opt=[...cantonEl.options].find(o=>o.value===d.canton||o.text.includes(d.canton));if(opt){cantonEl.value=opt.value;cantonEl.dispatchEvent(new Event('change',{bubbles:true}));}}
      const affEl=document.getElementById('proj-affectation');
      if(affEl&&d.affectation){const opt=[...affEl.options].find(o=>o.value===d.affectation);if(opt){affEl.value=opt.value;affEl.dispatchEvent(new Event('change',{bubbles:true}));}}
      this.set('proj-annee',d.annee_construction);
      this.set('proj-etages',d.nb_etages);
      this.set('proj-apparts',d.nb_logements);
      if(d.sre_estime) this.set('proj-sre',d.sre_estime);
      if(d.type_chauffage_code){const ch=document.getElementById('tech-type-chauffage');const m=this.CHAUF_MAP[d.type_chauffage_code];if(ch&&m){ch.value=m;ch.dispatchEvent(new Event('change',{bubbles:true}));}}
      if(d.agent_energetique){const ag=document.getElementById('tech-agent');if(ag){const opt=[...ag.options].find(o=>o.value.toLowerCase().includes(d.agent_energetique.toLowerCase())||d.agent_energetique.toLowerCase().includes(o.value.toLowerCase()));if(opt){ag.value=opt.value;ag.dispatchEvent(new Event('change',{bubbles:true}));}}}
      UI.updateHeader();
      const det=[d.affectation==='hab_ind'?'Hab. individuel':'Hab. collectif',d.nb_etages?d.nb_etages+' etages':'',d.nb_logements?d.nb_logements+' logements':'',d.annee_construction?'~'+d.annee_construction:'',d.type_chauffage?d.type_chauffage:'',d.egid?'EGID: '+d.egid:''].filter(Boolean).join(' - ');
      UI.toast((d.adresse||adresse.split(',')[0])+' : '+det,'success');
    }catch(e){console.error('GeoAdmin:',e);UI.toast('Erreur: '+e.message,'error');}
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  STATE.nouveau();
  UI.bindFields();
  document.querySelectorAll('.nav-tab').forEach(tab=>{tab.addEventListener('click',()=>{UI.showSection(tab.dataset.section);if(tab.dataset.section==='terrain')TERRAIN.refresh();if(tab.dataset.section==='bureau')BUREAU.refresh();if(tab.dataset.section==='mesures')MESURES.afficher();if(tab.dataset.section==='variantes')VARIANTES.afficher();});});
  document.querySelectorAll('.sub-tab').forEach(tab=>{tab.addEventListener('click',()=>{const s=tab.dataset.subsection;const p=tab.closest('.section,#app-main');p?.querySelectorAll('.sub-tab').forEach(t=>t.classList.remove('active'));p?.querySelectorAll('.subsection').forEach(s2=>s2.classList.remove('active'));tab.classList.add('active');document.getElementById(s)?.classList.add('active');});});
  document.getElementById('btn-save')?.addEventListener('click',()=>STATE.sauvegarder());
  document.getElementById('btn-open')?.addEventListener('click',()=>document.getElementById('file-input')?.click());
  document.getElementById('file-input')?.addEventListener('change',async(e)=>{const f=e.target.files[0];if(f){await STATE.charger(f);UI.syncFields();UI.updateHeader();TERRAIN.refresh();BUREAU.refresh();}e.target.value='';});
  document.getElementById('btn-recherche-adresse')?.addEventListener('click',()=>{const a=document.getElementById('input-recherche-adresse')?.value?.trim();if(!a){UI.toast('Entrez une adresse','error');return;}GEOADMIN.remplirFormulaire(a);});
  document.getElementById('input-recherche-adresse')?.addEventListener('keydown',(e)=>{if(e.key==='Enter'){const a=e.target.value?.trim();if(a)GEOADMIN.remplirFormulaire(a);}});
  document.getElementById('btn-charger-subventions')?.addEventListener('click',()=>{const npa=document.getElementById('proj-npa')?.value;const loc=document.getElementById('proj-localite')?.value;if(!npa){UI.toast('Entrez un NPA','error');return;}window.open('https://www.francsenergie.ch/fr/'+npa+'-'+(loc||''),'_blank');UI.toast('francsenergie.ch ouvert','info');});
  document.getElementById('btn-goto-terrain')?.addEventListener('click',()=>{UI.showSection('terrain');TERRAIN.refresh();});
  document.getElementById('proj-nom')?.addEventListener('input',UI.updateHeader.bind(UI));
  document.getElementById('proj-localite')?.addEventListener('input',UI.updateHeader.bind(UI));
  document.querySelectorAll('[data-mandat]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('[data-mandat]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');STATE.set('projet.type_mandat',btn.dataset.mandat);const isPlus=btn.dataset.mandat==='cecb_plus';document.querySelectorAll('.nav-tab.phase2').forEach(t=>{t.style.display=isPlus?'':'none';});});});
  document.getElementById('tech-pv')?.addEventListener('change',(e)=>{document.getElementById('tech-pv-details').style.display=e.target.value==='oui'?'block':'none';});
  document.getElementById('btn-generer-textes')?.addEventListener('click',()=>IA.genererTextesCECB());
  document.getElementById('btn-copier-etat-initial')?.addEventListener('click',()=>MESURES.copierEtatInitial());
  document.getElementById('btn-auto-mesures')?.addEventListener('click',()=>MESURES.suggererAutomatiquement());
  document.getElementById('btn-generer-variantes')?.addEventListener('click',()=>IA.genererToutesVariantes());
  document.getElementById('btn-calc-subventions')?.addEventListener('click',()=>SUBVENTIONS.calculerTout());
  document.getElementById('btn-conseil-ia')?.addEventListener('click',()=>IA.genererConseil());
  document.getElementById('btn-export-p1')?.addEventListener('click',()=>EXPORT.phase1());
  document.getElementById('btn-export-p2')?.addEventListener('click',()=>EXPORT.phase2());
  document.getElementById('btn-export-resume')?.addEventListener('click',()=>EXPORT.resume());
  STATE.onChange((path)=>{if(path==='all'){UI.syncFields();UI.updateHeader();TERRAIN.refresh();BUREAU.refresh();}});
  document.querySelectorAll('.modal-close,.modal-overlay').forEach(el=>{el.addEventListener('click',()=>{el.closest('.modal')?.style&&(el.closest('.modal').style.display='none');});});
  window.addEventListener('beforeunload',(e)=>{if(STATE.isDirty()){e.preventDefault();e.returnValue='';}});
  document.querySelectorAll('.photo-zone').forEach(zone=>UI.setupPhotoZone(zone));
  UI.showSection('projet');
  UI.updateHeader();
  console.log('CECB App Frilow v'+CONFIG.version);
});