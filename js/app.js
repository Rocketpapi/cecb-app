/**
 * app.js — Point d'entrée principal
 */

document.addEventListener('DOMContentLoaded', () => {
  STATE.nouveau();
  UI.bindFields();

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      UI.showSection(tab.dataset.section);
      if(tab.dataset.section==='terrain')TERRAIN.refresh();
      if(tab.dataset.section==='bureau')BUREAU.refresh();
      if(tab.dataset.section==='mesures')MESURES.afficher();
      if(tab.dataset.section==='variantes')VARIANTES.afficher();
    });
  });

  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const subsection = tab.dataset.subsection;
      const parent = tab.closest('.section, #app-main');
      parent?.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      parent?.querySelectorAll('.subsection').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(subsection)?.classList.add('active');
    });
  });

  document.getElementById('btn-save')?.addEventListener('click',()=>STATE.sauvegarder());
  document.getElementById('btn-open')?.addEventListener('click',()=>document.getElementById('file-input')?.click());
  document.getElementById('file-input')?.addEventListener('change',async(e)=>{
    const file=e.target.files[0];
    if(file){await STATE.charger(file);UI.syncFields();UI.updateHeader();TERRAIN.refresh();BUREAU.refresh();}
    e.target.value='';
  });

  document.getElementById('btn-charger-subventions')?.addEventListener('click',()=>{
    const npa=document.getElementById('proj-npa')?.value;
    const loc=document.getElementById('proj-localite')?.value;
    if(!npa){UI.toast('Entrez d\'abord un NPA','error');return;}
    window.open(`https://www.francsenergie.ch/fr/${npa}-${loc||''}/building/personal`,'_blank');
    UI.toast('Page francsenergie.ch ouverte','info');
  });

  document.getElementById('btn-goto-terrain')?.addEventListener('click',()=>{UI.showSection('terrain');TERRAIN.refresh();});
  document.getElementById('proj-nom')?.addEventListener('input',UI.updateHeader.bind(UI));
  document.getElementById('proj-localite')?.addEventListener('input',UI.updateHeader.bind(UI));

  document.querySelectorAll('[data-mandat]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-mandat]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); STATE,st('projet.type_mandat',btn.dataset.mandat);
      const isPlus=btn.dataset.mandat==='cecb_plus';
      document.querySelectorAll('.nav-tab.phase2').forEach(t=>{t.style.display=isPlus?'':'none';});
    });
  });

  document.getElementById('tech-pv')?.addEventListener('change',(e)=>{
    document.getElementById('tech-pv-details').style.display=e.target.value==='oui'?'block':'none';
  });

  document.getElementById('btn-generer-textes')?.addEventListener('click',()=>IA.genererTextesCECB());
  document.getElementById('btn-copier-etat-initial')?.addEventListener('click',()=>MESURES.copierEtatInitial());
  document.getElementById('btn-auto-mesures')?.addEventListener('click',()=>MESUREQ.suggererAutomatiquement());
  document.getElementById('btn-generer-variantes')?.addEventListener('click',()=>IA.genererToutesVariantes());
  document.getElementById('btn-calc-subventions')?.addEventListener('click',()=>SUBVENTIONS.calculerTout());
  document.getElementById('btn-conseil-ia')?.addEventListener('click',()=>IA.genererConseil());
  document.getElementById('btn-export-p1')?.addEventListener('click',()=>EXPORT.phase1());
  document.getElementById('btn-export-p2')?.addEventListener('click',()=>EXPORT.phase2());
  document.getElementById('btn-export-resume')?.addEventListener('click',()=>EXPORT.resume());

  STATE.onChange((path)=>{ if(path==='all'){UI.syncFields();UI.updateHeader();TERRAIN.refresh();BUREAU.refresh();} });

  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el=>{
    el.addEventListener('click',()=>{el.closest('.modal')?.style&&(el.closest('.modal').style.display='none');});
  });

  window.addEventListener('beforeunload',(e)=>{ if(STATE.isDirty()){e.preventDefault();e.returnValue='';} });
  document.querySelectorAll('.photo-zone').forEach(zone=>UI.setupPhotoZone(zone));

  UI.showSection('projet');
  UI.updateHeader();
  console.log('✅ CECB App Frilow initialisée v'+CONFIG.version);
});
