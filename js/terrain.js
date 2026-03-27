/**
 * terrain.js - Mode visite terrain CECB conforme
 * Version sans backticks pour compatibilite HTML inline
 */

const TERRAIN = {

  SECTIONS: {
    toits: {
      label: 'Toits et plafonds', icon: '\u{1F3A0}',
      generalites: [{key:'type_toiture', label:'Type de toiture', type:'select',
        options:['Toiture plate','Toit incline','Toit en terrasse','Toit mixte']}],
      sousections: [
        {key:'contre_ext', label:'Toits / plafonds contre ext\u00E9rieur',
         denom_defaut:'M1_TOITURE_EXIST_C.E.', abrev_prefix:'To',
         types:['Toit plat / terrasse','Toit incline N','Toit incline S','Toit incline E','Toit incline O','Plafond contre ext\u00E9rieur'],
         orientations:['Horiz','N','S','E','O'], colonnes:['surface','u_value','nbre','annee','orientation']},
        {key:'autres', label:'Autres plafonds',
         denom_defaut:'M1_PLAFOND_EXIST_C.N.C.', abrev_prefix:'Pl',
         types:['Plafond contre non chauffe','Plafond sur terre-plein','Autre'],
         orientations:['Horiz'], colonnes:['surface','u_value','b','nbre','annee']}
      ]
    },
    murs: {
      label: 'Murs', icon: '\u{1F9F1}',
      generalites: [
        {key:'structure_facades', label:'Structure des facades', type:'select',
         options:['facades lisses et pleines','facades avec decrochements','facades complexes']},
        {key:'soustraction_auto', label:'Soustraire surface fenetres auto', type:'checkbox'}
      ],
      sousections: [
        {key:'contre_ext', label:'Murs contre ext\u00E9rieur',
         denom_defaut:'M2_FACADE_EXIST_C.E.', abrev_prefix:'Mu',
         types:['Mur ext\u00E9rieur'],
         orientations:['N','S','E','O','NE','NO','SE','SO'],
         colonnes:['surface','u_value','b','nbre','annee','orientation']},
        {key:'autres', label:'Autres murs',
         denom_defaut:'M2_MUR_EXIST_C.N.C.', abrev_prefix:'Mu',
         types:['Mur contre non chauffe','Mur contre sol','Autre'],
         orientations:['N','S','E','O'],
         colonnes:['surface','u_value','b','nbre','annee','orientation']}
      ]
    },
    fenetres: {
      label: 'Fen\u00EAtres et portes', icon: '\u{1FAA9}',
      generalites: [{key:'soustraction_auto', label:'Soustraire surface fenetres auto', type:'checkbox'}],
      sousections: [
        {key:'fenetres', label:'Fen\u00EAtres et portes',
         denom_defaut:'Fe PVC, > 90, 2-IV-IR, Ar, int. > 10 mm, Ug 1.3', abrev_prefix:'Fe',
         types:['Fen\u00EAtre','Porte-fen\u00EAtre','Porte ext\u00E9rieure','Fen\u00EAtre de toit','Porte de garage'],
         orientations:['N','S','E','O','NE','NO','SE','SO'],
         colonnes:['surface','u_value','g','fs','b','nbre','annee','orientation','dans']}
      ]
    },
    sols: {
      label: 'Sols', icon: '\u2B1B',
      generalites: [{key:'part_sous_sol', label:'Part de sous-sol chauffee', type:'select',
        options:['','0%','25%','50%','75%','100%']}],
      sousections: [
        {key:'contre_ext', label:'Sols contre ext\u00E9rieur',
         denom_defaut:'M3_SOL_EXIST_C.E.', abrev_prefix:'So',
         types:['Sol sur terre-plein','Sol sur vide sanitaire','Sol sur ext\u00E9rieur'],
         colonnes:['surface','u_value','b','nbre','annee']},
        {key:'autres', label:'Autres sols',
         denom_defaut:'M3_SOL_EXIST_C.N.C.', abrev_prefix:'So',
         types:['Sol contre non chauffe','Sol sur cave non chauffee','Autre'],
         colonnes:['surface','u_value','b','nbre','annee']}
      ]
    },
    ponts: {
      label: 'Ponts thermiques', icon: '\u26A0\uFE0F',
      generalites: [],
      sousections: [
        {key:'ponts', label:'Ponts thermiques',
         denom_defaut:'PT_EXIST', abrev_prefix:'Pt',
         types:['Lin\u00E9ique','Ponctuel'],
         colonnes:['longueur','psi','nbre','annee']}
      ]
    }
  },

  ETATS: [
    {value:'', label:'-- S\u00E9lectionner --'},
    {value:'neuf', label:"(\u00E0 l') \u00E9tat neuf"},
    {value:'bon', label:'en bon \u00E9tat'},
    {value:'use', label:'us\u00E9'},
    {value:'mauvais', label:'en mauvais \u00E9tat'},
    {value:'tres_mauvais', label:'en tr\u00E8s mauvais \u00E9tat'}
  ],

  refresh: function() {
    if (!STATE.dossier) STATE.nouveau();
    this.afficherSections();
    if (typeof UI !== 'undefined') UI.syncFields();
  },

  getEnvData: function() {
    if (!STATE.dossier) STATE.nouveau();
    if (!STATE.dossier.terrain_enveloppe) STATE.dossier.terrain_enveloppe = {};
    return STATE.dossier.terrain_enveloppe;
  },

  afficherSections: function() {
    var c = document.getElementById('terrain-enveloppe-container');
    if (!c) return;
    if (!STATE.dossier) STATE.nouveau();
    var data = STATE.dossier.terrain_enveloppe || {};
    var html = '';
    var sections = this.SECTIONS;
    var self = this;
    Object.keys(sections).forEach(function(k) {
      html += self.renderSection(k, sections[k], data[k] || {});
    });
    c.innerHTML = html;
    this.attachListeners(c);
  },

  renderSection: function(k, s, data) {
    var gH = '';
    var self = this;
    s.generalites.forEach(function(g) { gH += self.renderGen(k, g, data); });
    var ssH = '';
    s.sousections.forEach(function(ss) {
      var ssData = data[ss.key] || {etat:'', priorite:'', texte:'', ameliorations:'', photo:null, elements:[]};
      ssH += self.renderSS(k, ss, ssData);
    });
    return '<div class="cecb-section" id="terrain-section-' + k + '">' +
      '<div class="cecb-section-header" onclick="this.parentElement.classList.toggle(\'collapsed\')">' +
      '<span>' + s.icon + '</span> <span class="cecb-section-title">' + s.label + '</span>' +
      '<span class="cecb-section-chevron">&#9660;</span></div>' +
      '<div class="cecb-section-body">' +
      (gH ? '<div class="cecb-generalites">' + gH + '</div>' : '') + ssH +
      '</div></div>';
  },

  renderGen: function(k, g, data) {
    if (g.type === 'select') {
      var opts = g.options.map(function(v) {
        return '<option value="' + v + '"' + (data[g.key] === v ? ' selected' : '') + '>' + v + '</option>';
      }).join('');
      return '<div class="form-group"><label>' + g.label + '</label>' +
        '<select class="terrain-gen-field" data-section="' + k + '" data-key="' + g.key + '">' + opts + '</select></div>';
    }
    if (g.type === 'checkbox') {
      return '<div class="form-group"><label><input type="checkbox" class="terrain-gen-field" data-section="' + k + '" data-key="' + g.key + '"' + (data[g.key] ? ' checked' : '') + '> ' + g.label + '</label></div>';
    }
    return '';
  },

  renderSS: function(k, ss, data) {
    var self = this;
    var eO = this.ETATS.map(function(e) {
      return '<option value="' + e.value + '"' + (data.etat === e.value ? ' selected' : '') + '>' + e.label + '</option>';
    }).join('');
    var tH = this.renderTableau(k, ss, data.elements || []);
    var pZ = this.renderPhoto(k, ss.key, data.photo);
    return '<div class="cecb-sousection" id="terrain-ss-' + k + '-' + ss.key + '">' +
      '<div class="cecb-sousection-header"><h4>' + ss.label + '</h4></div>' +
      '<div class="cecb-sousection-body"><div class="cecb-row-3col">' +
      '<div class="cecb-col-text">' +
      '<div class="form-group"><label>Etat general</label><select class="terrain-ss-field" data-section="' + k + '" data-ss="' + ss.key + '" data-key="etat">' + eO + '</select></div>' +
      '<div class="form-group"><label>Priorite</label><select class="terrain-ss-field" data-section="' + k + '" data-ss="' + ss.key + '" data-key="priorite"><option value="">--</option><option value="1"' + (data.priorite==='1'?' selected':'') + '>1 - Urgent</option><option value="2"' + (data.priorite==='2'?' selected':'') + '>2 - Important</option><option value="3"' + (data.priorite==='3'?' selected':'') + '>3 - Planifie</option></select></div>' +
      '<div class="form-group"><label>Etat (' + (data.texte||'').length + '/1000)</label><textarea class="terrain-ss-field" data-section="' + k + '" data-ss="' + ss.key + '" data-key="texte" rows="3" maxlength="1000">' + (data.texte||'') + '</textarea></div>' +
      '<div class="form-group"><label>Ameliorations (' + (data.ameliorations||'').length + '/1000)</label><textarea class="terrain-ss-field" data-section="' + k + '" data-ss="' + ss.key + '" data-key="ameliorations" rows="3" maxlength="1000">' + (data.ameliorations||'') + '</textarea></div>' +
      '</div><div class="cecb-col-photo">' + pZ + '</div></div>' + tH + '</div></div>';
  },

  renderPhoto: function(k, sk, photo) {
    if (photo) return '<div class="cecb-photo-zone" data-section="' + k + '" data-ss="' + sk + '" style="position:relative"><img src="' + photo + '" style="width:100%;border-radius:8px"><button class="btn-danger btn-sm cecb-photo-del" data-section="' + k + '" data-ss="' + sk + '" style="position:absolute;top:4px;right:4px">X</button></div>';
    return '<div class="cecb-photo-zone cecb-photo-empty" data-section="' + k + '" data-ss="' + sk + '" style="min-height:150px;display:flex;align-items:center;justify-content:center"><div style="text-align:center;color:#aaa;padding:20px"><div style="font-size:2rem">&#128247;</div><button class="btn-secondary btn-sm" style="margin-top:10px" onclick="TERRAIN.ouvrirPhoto('' + k + '\','' + sk + '\')">Importer</button></div><input type="file" accept="image/*" capture="environment" style="display:none" class="photo-input" data-section="' + k + '" data-ss="' + sk + '"></div>';
  },

  renderTableau: function(k, ss, elements) {
    var hS=ss.colonnes.indexOf('surface')>=0, hU=ss.colonnes.indexOf('u_value')>=0;
    var hG=ss.colonnes.indexOf('g')>=0, hFs=ss.colonnes.indexOf('fs')>=0;
    var hB=ss.colonnes.indexOf('b')>=0, hD=ss.colonnes.indexOf('dans')>=0;
    var hO=ss.colonnes.indexOf('orientation')>=0, hL=ss.colonnes.indexOf('longueur')>=0;
    var hPsi=ss.colonnes.indexOf('psi')>=0;
    var head='<tr><th>Abrev.</th><th>Denomination</th><th>Type</th><th>Annee</th>'+(hO?'<th>Orient.</th>':'')+(hS?'<th>Surface [m2]</th>':'')+(hU?'<th>Valeur U [W/m2K]</th>':'')+(hG?'<th>g</th>':'')+(hFs?'<th>Fs</th>':'')+(hB?'<th>b</th>':'')+(hL?'<th>Long. [m]</th>':'')+(hPsi?'<th>Psi [W/mK]</th>':'')+'<th>Nbre</th>'+(hD?'<th>Dans</th>':'')+'<th></th></tr>';
    var yr=(STATE.get&&STATE.get('projet.annee_construction'))||'';
    var rows=elements.length===0?'<tr><td colspan="15" style="text-align:center;color:#aaa;padding:12px">Aucune donnee presente</td></tr>':elements.map(function(el,i){
      var tO=ss.types.map(function(t){return '<option'+(el.type===t?' selected':'')+'>'+t+'</option>';}).join('');
      var oO=(ss.orientations||[]).map(function(o){return '<option'+(el.orientation===o?' selected':'')+'>'+o+'</option>';}).join('');
      return '<tr><td><input type="text" value="'+(el.abrev||'')+'" class="el-abrev" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:55px"></td><td><input type="text" value="'+(el.denom||ss.denom_defaut)+'" class="el-denom" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="min-width:140px"></td><td><select class="el-type" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'">'+tO+'</select></td><td><input type="number" value="'+(el.annee||'')+'" class="el-annee" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" placeholder="'+yr+'" style="width:55px"></td>'+(hO?'<td><select class="el-orient" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px">'+oO+'</select></td>':'')+(hS?'<td><input type="number" step="0.1" value="'+(el.surface||'')+'" class="el-surface" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:60px"></td>':'')+(hU?'<td><input type="number" step="0.01" value="'+(el.u_value||'')+'" class="el-u" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+(hG?'<td><input type="number" step="0.01" value="'+(el.g||'')+'" class="el-g" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hFs?'<td><input type="number" step="0.01" value="'+(el.fs||'')+'" class="el-fs" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hB?'<td><input type="number" step="0.01" value="'+(el.b||1)+'" class="el-b" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:40px"></td>':'')+(hL?'<td><input type="number" step="0.1" value="'+(el.longueur||'')+'" class="el-longueur" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+(hPsi?'<td><input type="number" step="0.001" value="'+(el.psi||'')+'" class="el-psi" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:50px"></td>':'')+'<td><input type="number" min="1" value="'+(el.nbre||1)+'" class="el-nbre" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="width:35px"></td>'+(hD?'<td><input type="text" value="'+(el.dans||'')+'" class="el-dans" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" placeholder="Mu-1" style="width:45px"></td>':'')+'<td><button class="btn-icon el-copy" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'">&#128203;</button><button class="btn-icon el-del" data-idx="'+i+'" data-section="'+k+'" data-ss="'+ss.key+'" style="color:#e53e3e">&#10005;</button></td></tr>';
    }).join('');
    return '<div class="cecb-tableau-wrapper"><table class="cecb-tableau"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table><button class="btn-primary btn-sm cecb-add-el" data-section="'+k+'" data-ss="'+ss.key+'" style="margin-top:8px">+ Nouveau</button></div>';
  },

  attachListeners: function(c) {
    var self=this;
    c.querySelectorAll('.terrain-gen-field').forEach(function(el){el.addEventListener('change',function(){self.saveGenField(el);});});
    c.querySelectorAll('.terrain-ss-field').forEach(function(el){var ev=el.tagName==='TEXTAREA'?'input':'change';el.addEventListener(ev,function(){self.saveSsField(el);});});
    c.querySelectorAll('[data-idx]').forEach(function(el){var ev=el.tagName==='SELECT'?'change':'input';el.addEventListener(ev,function(){self.saveElement(el);});});
    c.querySelectorAll('.cecb-add-el').forEach(function(btn){btn.addEventListener('click',function(){self.ajouterElement(btn.dataset.section,btn.dataset.ss);});});
    c.querySelectorAll('.el-copy').forEach(function(btn){btn.addEventListener('click',function(){self.dupliquerElement(btn.dataset.section,btn.dataset.ss,parseInt(btn.dataset.idx));});});
    c.querySelectorAll('.el-del').forEach(function(btn){btn.addEventListener('click',function(){self.supprimerElement(btn.dataset.section,btn.dataset.ss,parseInt(btn.dataset.idx));});});
    c.querySelectorAll('.cecb-photo-zone').forEach(function(z){
      z.addEventListener('click',function(e){if(e.target.classList.contains('cecb-photo-del'))self.supprimerPhoto(z.dataset.section,z.dataset.ss);else if(!e.target.classList.contains('cecb-photo-img'))self.ouvrirPhoto(z.dataset.section,z.dataset.ss);});
      z.addEventListener('dragover',function(e){e.preventDefault();z.classList.add('drag-over');});
      z.addEventListener('dragleave',function(){z.classList.remove('drag-over');});
      z.addEventListener('drop',function(e){e.preventDefault();z.classList.remove('drag-over');var f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))self.chargerPhoto(z.dataset.section,z.dataset.ss,f);});
    });
    c.querySelectorAll('.photo-input').forEach(function(inp){inp.addEventListener('change',function(e){var f=e.target.files[0];if(f)self.chargerPhoto(inp.dataset.section,inp.dataset.ss,f);});});
  },

  saveGenField:function(el){var d=this.getEnvData();if(!d[el.dataset.section])d[el.dataset.section]={};d[el.dataset.section][el.dataset.key]=el.type==='checkbox'?el.checked:el.value;STATE._dirty=true;},
  saveSsField:function(el){var d=this.getEnvData(),k=el.dataset.section,ss=el.dataset.ss;if(!d[k])d[k]={};if(!d[k][ss])d[k][ss]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};d[k][ss][el.dataset.key]=el.value;STATE._dirty=true;},
  saveElement:function(el){var d=this.getEnvData(),k=el.dataset.section,ss=el.dataset.ss,i=parseInt(el.dataset.idx);if(!d[k]||!d[k][ss]||!d[k][ss].elements)return;var elem=d[k][ss].elements[i];if(!elem)return;var cls=Array.from(el.classList).find(function(c){return c.indexOf('el-')===0;});var fm={'el-abrev':'abrev','el-denom':'denom','el-type':'type','el-annee':'annee','el-orient':'orientation','el-surface':'surface','el-u':'u_value','el-g':'g','el-fs':'fs','el-b':'b','el-longueur':'longueur','el-psi':'psi','el-nbre':'nbre','el-dans':'dans'};if(fm[cls]){elem[fm[cls]]=el.type==='number'?(parseFloat(el.value)||''):el.value;STATE._dirty=true;}},
  ajouterElement:function(k,sk){var d=this.getEnvData();if(!d[k])d[k]={};if(!d[k][sk])d[k][sk]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};var els=d[k][sk].elements;var ss=this.SECTIONS[k].sousections.find(function(s){return s.key===sk;});var prefix=ss.abrev_prefix;var num=els.filter(function(e){return e.abrev&&e.abrev.indexOf(prefix)===0;}).length+1;var yr=(STATE.get&&STATE.get('projet.annee_construction'))||'';els.push({abrev:prefix+'-'+num,denom:ss.denom_defaut,type:ss.types[0],annee:yr,surface:'',u_value:'',g:'',fs:'',b:'1.0',longueur:'',psi:'',nbre:1,orientation:(ss.orientations&&ss.orientations[0])||'',dans:''});STATE._dirty=true;this.afficherSections();var el=document.getElementById('terrain-ss-'+k+'-'+sk);if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'end'});},100);},
  dupliquerElement:function(k,sk,idx){var d=this.getEnvData();if(!d[k]||!d[k][sk]||!d[k][sk].elements||!d[k][sk].elements[idx])return;var ss=this.SECTIONS[k].sousections.find(function(s){return s.key===sk;});var els=d[k][sk].elements;var copie=Object.assign({},els[idx]);var prefix=ss.abrev_prefix;copie.abrev=prefix+'-'+(els.filter(function(e){return e.abrev&&e.abrev.indexOf(prefix)===0;}).length+1);els.splice(idx+1,0,copie);STATE._dirty=true;this.afficherSections();},
  supprimerElement:function(k,sk,idx){var d=this.getEnvData();if(!d[k]||!d[k][sk]||!d[k][sk].elements)return;d[k][sk].elements.splice(idx,1);STATE._dirty=true;this.afficherSections();},
  ouvrirPhoto:function(k,sk){var inp=document.querySelector('.photo-input[data-section="'+k+'"][data-ss="'+sk+'"]');if(inp)inp.click();},
  chargerPhoto:function(k,sk,file){var self=this;var reader=new FileReader();reader.onload=function(e){var d=self.getEnvData();if(!d[k])d[k]={};if(!d[k][sk])d[k][sk]={etat:'',priorite:'',texte:'',ameliorations:'',photo:null,elements:[]};d[k][sk].photo=e.target.result;STATE._dirty=true;self.afficherSections();};reader.readAsDataURL(file);},
  supprimerPhoto:function(k,sk){var d=this.getEnvData();if(d[k]&&d[k][sk]){d[k][sk].photo=null;STATE._dirty=true;this.afficherSections();}}
};

window.TERRAIN = TERRAIN;