const TERRAIN = {
  SECTIONS: {
    toits: { label:'Toits et plafonds', icon:'🏠',
      generalites:[{key:'type_toiture',label:'Type de toiture',type:'select',options:['Toiture plate','Toit incliné','Toit en terrasse','Toit mixte']}],
      sousections:[
        {key:'contre_ext',label:'Toits / plafonds contre extérieur',denom_defaut:'M1_TOITURE_EXIST_C.E.',abrev_prefix:'To',
         types:['Toit plat / terrasse','Toit incliné N','Toit incliné S','Toit incliné E','Toit incliné O','Plafond contre extérieur'],
         orientations:['Horiz','N','S','E','O'],colonnes:['surface','u_value','nbre','annee','orientation']},
        {key:'autres',label:'Autres plafonds',denom_defaut:'M1_PLAFOND_EXIST_C.N.C.',abrev_prefix:'Pl',
         types:['Plafond contre non chauffé','Plafond sur terre-plein','Autre'],
         orientations:['Horiz'],colonnes:['surface','u_value','b','nbre','annee']}
      ]},
    murs: { label:'Murs', icon:'🧱',
      generalites:[
        {key:'structure_facades',label:'Structure des façades',type:'select',options:['façades lisses et pleines','façades avec décrochements','façades complexes']},
        {key:'soustraction_auto',label:'Soustraire automatiquement surface de fenêtres',type:'checkbox'}
      ],
      sousections:[
        {key:'contre_ext',label:'Murs contre extérieur',denom_defaut:'M2_FACADE_EXIST_C.E.',abrev_prefix:'Mu',
         types:['Mur extérieur'],orientations:['N','S','E','O','NE','NO','SE','SO'],
         colonnes:['surface','u_value','b','nbre','annee','orientation']},
        {key:'autres',label:'Autres murs',denom_defaut:'M2_MUR_EXIST_C.N.C.',abrev_prefix:'Mu',
         types:['Mur contre non chauffé','Mur contre sol','Autre'],
         orientations:['N','S','E','O'],colonnes:['surface','u_value','b','nbre','annee','orientation']}
      ]},
    fenetres: { label:'Fenêtres et portes', icon:'🪟',
      generalites:[{key:'soustraction_auto',label:'Soustraire automatiquement surface de fenêtres',type:'checkbox'}],
      sousections:[
        {key:'fenetres',label:'Fenêtres et portes',denom_defaut:'Fe PVC, > 90, 2-IV-IR, Ar, int. > 10 mm, Ug 1.3',abrev_prefix:'Fe',
         types:['Fenêtre','Porte-fenêtre','Porte extérieure','Fenêtre de toit','Porte de garage'],
         orientations:['N','S','E','O','NE','NO','SE','SO'],
         colonnes:['surface','u_value','g','fs','b','nbre','annee','orientation','dans']}
      ]},
    sols: { label:'Sols', icon:'⬛',
      generalites:[{key:'part_sous_sol',label:'Part de sous-sol chauffée',type:'select',options:['','0%','25%','50%','75%','100%']}],
      sousections:[
        {key:'contre_ext',label:'Sols contre extérieur',denom_defaut:'M3_SOL_EXIST_C.E.',abrev_prefix:'So',
         types:['Sol sur terre-plein','Sol sur vide sanitaire','Sol sur extérieur'],
         colonnes:['surface','u_value','b','nbre','annee']},
        {key:'autres',label:'Autres sols',denom_defaut:'M3_SOL_EXIST_C.N.C.',abrev_prefix:'So',
         types:['Sol contre non chauffé','Sol sur cave non chauffée','Autre'],
         colonnes:['surface','u_value','b','nbre','annee']}
      ]},
    ponts: { label:'Ponts thermiques', icon:'⚠️',
      generalites:[],
      sousections:[
        {key:'ponts',label:'Ponts thermiques',denom_defaut:'PT_EXIST',abrev_prefix:'Pt',
         types:['Linéique','Ponctuel'],colonnes:['longueur','psi','nbre','annee']}
      ]}
  },
  ETATS:[
    {value:'',label:'-- Sélectionner --'},{value:'neuf',label:"(à l') état neuf"},
    {value:'bon',label:'en bon état'},{value:'use',label:'usé'},
    {value:'mauvais',label:'en mauvais état'},{value:'tres_mauvais',label:'en très mauvais état'}
  ],
  refresh(){ this.afficherSections(); if(typeof UI!=='undefined')UI.syncFields(); },
  getEnvData(){ if(!STATE.dossier.terrain_enveloppe)STATE.dossier.terrain_enveloppe={}; return STATE.dossier.terrain_enveloppe; },
  afficherSections(){
    const c=document.getElementById('terrain-enveloppe-container'); if(!c)return;
    const data=STATE.dossier?.terrain_enveloppe||{};
    c.innerHTML=Object.entries(this.SECTIONS).map(([k,s])=>this.renderSection(k,s,data[k]||{})).join('');
    this.attachListeners(c);
  },
  renderSection(k,s,data){
    const gH=s.generalites.map(g=>this.renderGen(k,g,data)).join('');
    const ssH=s.sousections.map(ss=>this.renderSS(k,ss,data[ss.key]||{etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]})).join('');
    return '<div class="cecb-section" id="terrain-section-'+k+'"><div class="cecb-section-header" onclick="this.parentElement.classList.toggle('collapsed')"><span>'+s.icon+'</span><span class="cecb-section-title">'+s.label+'</span><span class="cecb-section-chevron">▼</span></div><div class="cecb-section-body">'+(gH?'<div class="cecb-generalites">'+gH+'</div>':'')+ssH+'</div></div>';
  },
  renderGen(k,g,data){
    if(g.type==='select'){const o=g.options.map(v=>'<option value="'+v+'"'+(data[g.key]===v?' selected':'')+'>'+v+'</option>').join('');return '<div class="form-group"><label>'+g.label+'</label><select class="terrain-gen-field" data-section="'+k+'" data-key="'+g.key+'">'+o+'</select></div>';}
    if(g.type==='checkbox'){return '<div class="form-group"><label><input type="checkbox" class="terrain-gen-field" data-section="'+k+'" data-key="'+g.key+'"'+(data[g.key]?' checked':'')+'>'+g.label+'</label></div>';}
    return '';
  },
  renderSS(k,ss,data){
    const eO=this.ETATS.map(e=>'<option value="'+e.value+'"'+(data.etat===e.value?' selected':'')+'>'+e.label+'</option>').join('');
    const tH=this.renderTableau(k,ss,data.elements||[]);
    const pZ=this.renderPhoto(k,ss.key,data.photo);
    return '<div class="cecb-sousection" id="terrain-ss-'+k+'-'+ss.key+'"><div class="cecb-sousection-header"><h4>'+ss.label+'</h4></div><div class="cecb-sousection-body"><div class="cecb-row-3col"><div class="cecb-col-text"><div class="form-group"><label>État général</label><select class="terrain-ss-field" data-section="'+k+'" data-ss="'+ss.key+'" data-key="etat">'+eO+'</select></div><div class="form-group"><label>Priorité</label><select class="terrain-ss-field" data-section="'+k+'" data-ss="'+ss.key+'" data-key="priorite"><option value="">--</option><option value="1"'+(data.priorite==='1'?' selected':'')+'>1 - Urgent</option><option value="2"'+(data.priorite==='2'?' selected':'')+'>2 - Important</option><option value="3"'+(data.priorite==='3'?' selected':'')+'>3 - Planifié</option></select></div><div class="form-group"><label>État <span style="color:#888;font-size:0.8em">'+((data.texte||'').length)+'/1000</span></label><textarea class="terrain-ss-field" data-section="'+k+'" data-ss="'+ss.key+'" data-key="texte" rows="3" maxlength="1000">'+( data.texte||'')+'</textarea></div><div class="form-group"><label>Améliorations possibles <span style="color:#888;font-size:0.8em">'+((data.ameliorations||'').length)+'/1000</span></label><textarea class="terrain-ss-field" data-section="'+k+'" data-ss="'+ss.key+'" data-key="ameliorations" rows="3" maxlength="1000">'+(data.ameliorations||'')+'</textarea></div></div><div class="cecb-col-photo">'+pZ+'</div></div>'+tH+'</div></div>';
  },
  renderPhoto(k,sk,photo){
    if(photo)return '<div class="cecb-photo-zone" data-section="'+k+'" data-ss="'+sk+'"><img src="'+photo+'" style="width:100%;border-radius:8px"><button class="btn-danger btn-sm cecb-photo-del" data-section="'+k+'" data-ss="'+sk+'" style="position:absolute;top:4px;right:4px">✕</button></div>';
    return '<div class="cecb-photo-zone cecb-photo-empty" data-section="'+k+'" data-ss="'+sk+'"><div style="text-align:center;color:#aaa;padding:20px"><div style="font-size:2rem">📷</div><button class="btn-secondary btn-sm" style="margin-top:10px" onclick="TERRAIN.ouvrirPhoto(''+k+'',''+sk+'')">Importer</button></div><input type="file" accept="image/*" capture="environment" style="display:none" class="photo-input" data-section="'+k+'" data-ss="'+sk+'"></div>';
  },
  renderTableau(k,ss,elements){
    const hS=ss.colonnes.includes('surface'),hU=ss.colonnes.includes('u_value'),hG=ss.colonnes.includes('g');
    const hFs=ss.colonnes.includes('fs'),hB=ss.colonnes.includes('b'),hD=ss.colonnes.includes('dans');
    const hO=ss.colonnes.includes('orientation'),hL=ss.colonnes.includes('longueur'),hPsi=ss.colonnes.includes('psi');
    const head='<tr><th>Abrév.</th><th>Dénomination</th><th>Type</th><th>Année</th>'+(hO?'<th>Orient.</th>':'')+(hS?'<th>Surface [m²]</th>':'')+(hU?'<th>Valeur U [W/m²K]</th>':'')+(hG?'<th>g</th>':'')+(hFs?'<th>Fs</th>':'')+(hB?'<th>b</th>':'')+(hL?'<th>Long. [m]</th>':'')+(hPsi?'<th>Ψ [W/mK]</th>':'')+'<th>Nbre</th>'+(hD?'<th>Dans</th>':'')+'<th></th></tr>';
    const rows=elements.length===0?'<tr><td colspan="15" style="text-align:center;color:#aaa;padding:12px">Aucune donnée présente</td></tr>':elements.map((el,i)=>{
      const yr=STATE.get('projet.annee_construction')||'';
      return '<tr><td><input type="text" value="'+(el.abrev||'')+'" class="el-abrev" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:55px"></td><td><input type="text" value="'+(el.denom||ss.denom_defaut)+'" class="el-denom" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="min-width:160px"></td><td><select class="el-type" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'">'+ss.types.map(t=>'<option'+(el.type===t?' selected':'')+'>'+t+'</option>').join('')+'</select></td><td><input type="number" value="'+(el.annee||'')+'" class="el-annee" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" placeholder="'+yr+'" style="width:55px"></td>'+(hO?'<td><select class="el-orient" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px">'+( ss.orientations||[]).map(o=>'<option'+(el.orientation===o?' selected':'')+'>'+o+'</option>').join('')+'</select></td>':'')+(hS?'<td><input type="number" step="0.1" value="'+(el.surface||'')+'" class="el-surface" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:60px"></td>':'')+(hU?'<td><input type="number" step="0.01" value="'+(el.u_value||'')+'" class="el-u" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+(hG?'<td><input type="number" step="0.01" value="'+(el.g||'')+'" class="el-g" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hFs?'<td><input type="number" step="0.01" value="'+(el.fs||'')+'" class="el-fs" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hB?'<td><input type="number" step="0.01" value="'+(el.b||1)+'" class="el-b" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hL?'<td><input type="number" step="0.1" value="'+(el.longueur||'')+'" class="el-longueur" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+(hPsi?'<td><input type="number" step="0.001" value="'+(el.psi||'')+'" class="el-psi" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+'<td><input type="number" min="1" value="'+(el.nbre||1)+'" class="el-nbre" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:35px"></td>'+(hD?'<td><input type="text" value="'+(el.dans||'')+'" class="el-dans" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" placeholder="Mu-1" style="width:45px"></td>':'')+'<td><button class="btn-icon el-copy" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'">📋</button><button class="btn-icon el-del" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="color:#e53e3e">✕</button></td></tr>';
    }).join('');
    return '<div class="cecb-tableau-wrapper"><table class="cecb-tableau"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table><button class="btn-primary btn-sm cecb-add-el" data-section="'+k+'" data-ss="'+ss.key+'" style="margin-top:8px">+ Nouveau</button></div>';
  },
  attachListeners(c){
    c.querySelectorAll('.terrain-gen-field').forEach(el=>el.addEventListener('change',()=>this.saveGenField(el)));
    c.querySelectorAll('.terrain-ss-field').forEach(el=>{const ev=el.tagName==='TEXTAREA'?'input':'change';el.addEventListener(ev,()=>this.saveSsField(el));});
    c.querySelectorAll('[data-idx]').forEach(el=>{const ev=el.tagName==='SELECT'?'change':'input';el.addEventListener(ev,()=>this.saveElement(el));});
    c.querySelectorAll('.cecb-add-el').forEach(btn=>btn.addEventListener('click',()=>this.ajouterElement(btn.dataset.section,btn.dataset.ss)));
    c.querySelectorAll('.el-copy').forEach(btn=>btn.addEventListener('click',()=>this.dupliquerElement(btn.dataset.section,btn.dataset.ss,parseInt(btn.dataset.idx))));
    c.querySelectorAll('.el-del').forEach(btn=>btn.addEventListener('click',()=>this.supprimerElement(btn.dataset.section,btn.dataset.ss,parseInt(btn.dataset.idx))));
    c.querySelectorAll('.cecb-photo-zone').forEach(z=>{
      z.addEventListener('click',e=>{if(e.target.classList.contains('cecb-photo-del'))this.supprimerPhoto(z.dataset.section,z.dataset.ss);else if(!e.target.classList.contains('cecb-photo-img'))this.ouvrirPhoto(z.dataset.section,z.dataset.ss);});
      z.addEventListener('dragover',e=>{e.preventDefault();z.classList.add('drag-over');});
      z.addEventListener('dragleave',()=>z.classList.remove('drag-over'));
      z.addEventListener('drop',e=>{e.preventDefault();z.classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))this.chargerPhoto(z.dataset.section,z.dataset.ss,f);});
    });
    c.querySelectorAll('.photo-input').forEach(inp=>inp.addEventListener('change',e=>{const f=e.target.files[0];if(f)this.chargerPhoto(inp.dataset.section,inp.dataset.ss,f);}));
  },
  saveGenField(el){const d=this.getEnvData();if(!d[el.dataset.section])d[el.dataset.section]={};d[el.dataset.section][el.dataset.key]=el.type==='checkbox'?el.checked:el.value;STATE._dirty=true;},
  saveSsField(el){const d=this.getEnvData(),k=el.dataset.section,ss=el.dataset.ss;if(!d[k])d[k]={};if(!d[k][ss])d[k][ss]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};d[k][ss][el.dataset.key]=el.value;STATE._dirty=true;},
  saveElement(el){const d=this.getEnvData(),k=el.dataset.section,ss=el.dataset.ss,i=parseInt(el.dataset.idx);if(!d[k]?.[ss]?.elements)return;const elem=d[k][ss].elements[i];if(!elem)return;const cls=[...el.classList].find(c=>c.startsWith('el-'));const fm={'el-abrev':'abrev','el-denom':'denom','el-type':'type','el-annee':'annee','el-orient':'orientation','el-surface':'surface','el-u':'u_value','el-g':'g','el-fs':'fs','el-b':'b','el-longueur':'longueur','el-psi':'psi','el-nbre':'nbre','el-dans':'dans'};if(fm[cls]){elem[fm[cls]]=el.type==='number'?parseFloat(el.value)||'':el.value;STATE._dirty=true;}},
  ajouterElement(k,sk){const d=this.getEnvData();if(!d[k])d[k]={};if(!d[k][sk])d[k][sk]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};const elements=d[k][sk].elements;const ss=this.SECTIONS[k].sousections.find(s=>s.key===sk);const num=elements.filter(e=>e.abrev?.startsWith(ss.abrev_prefix)).length+1;elements.push({abrev:ss.abrev_prefix+'-'+num,denom:ss.denom_defaut,type:ss.types[0],annee:STATE.get('projet.annee_construction')||'',surface:'',u_value:'',g:'',fs:'',b:'1.0',longueur:'',psi:'',nbre:1,orientation:ss.orientations?.[0]||'',dans:''});STATE._dirty=true;this.afficherSections();setTimeout(()=>document.getElementById('terrain-ss-'+k+'-'+sk)?.scrollIntoView({behavior:'smooth',block:'end'}),100);},
  dupliquerElement(k,sk,idx){const d=this.getEnvData();const els=d[k]?.[sk]?.elements;if(!els||!els[idx])return;const ss=this.SECTIONS[k].sousections.find(s=>s.key===sk);const c={...els[idx]};c.abrev=ss.abrev_prefix+'-'+(els.filter(e=>e.abrev?.startsWith(ss.abrev_prefix)).length+1);els.splice(idx+1,0,c);STATE._dirty=true;this.afficherSections();},
  supprimerElement(k,sk,idx){const d=this.getEnvData();const els=d[k]?.[sk]?.elements;if(!els)return;els.splice(idx,1);STATE._dirty=true;this.afficherSections();},
  ouvrirPhoto(k,sk){document.querySelector('.photo-input[data-section="'+k+'"][data-ss="'+sk+'"]')?.click();},
  chargerPhoto(k,sk,file){const r=new FileReader();r.onload=e=>{const d=this.getEnvData();if(!d[k])d[k]={};if(!d[k][sk])d[k][sk]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};d[k][sk].photo=e.target.result;STATE._dirty=true;this.afficherSections();};r.readAsDataURL(file);},
  supprimerPhoto(k,sk){const d=this.getEnvData();if(d[k]?.[sk]){d[k][sk].photo=null;STATE._dirty=true;this.afficherSections();}}
};
window.TERRAIN=TERRAIN;