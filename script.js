(function () {
  'use strict';

  // IDs other than YouTube are plausible candidates, not verified on this particular TV.
  var catalog = [
    { key:'youtube', name:'YouTube', logo:'▶', ids:['youtube.leanback.v4'] },
    { key:'netflix', name:'Netflix', logo:'N', ids:['netflix'] },
    { key:'prime', name:'Prime Video', logo:'prime<br>video', ids:['amazon','com.amazon.amazonvideo.livingroom'] },
    { key:'hulu', name:'Hulu', logo:'hulu', ids:['hulu','hulu.leanback'] },
    { key:'peacock', name:'Peacock', logo:'peacock', ids:['com.peacock.tv'] },
    { key:'disney', name:'Disney+', logo:'Disney+', ids:['com.disney.disneyplus-prod'] },
    { key:'max', name:'Max', logo:'max', ids:['max','com.wbd.stream'] },
    { key:'apple', name:'Apple TV', logo:'tv+', ids:['com.apple.appletv','appleTV'] },
    { key:'paramount', name:'Paramount+', logo:'P+', ids:['com.cbs.ott','paramountplus'] },
    { key:'spotify', name:'Spotify', logo:'♫', ids:['spotify-beehive'] }
  ];
  var themes = [
    {key:'itachi',title:'Itachi Uchiha',subtitle:'The Shadow of the Leaf',image:'assets/itachi-cinematic.jpg'},
    {key:'akatsuki',title:'Akatsuki',subtitle:'The Red Cloud',image:'assets/akatsuki-cinematic.jpg'},
    {key:'kakashi',title:'Kakashi Hatake',subtitle:'The Copy Ninja',image:'assets/kakashi-cinematic.jpg'},
    {key:'sasuke',title:'Sasuke Uchiha',subtitle:'The Avenger',image:'assets/sasuke-cinematic.jpg'},
    {key:'madara',title:'Madara Uchiha',subtitle:'Ghost of the Uchiha',image:'assets/madara-cinematic.jpg'},
    {key:'naruto',title:'Naruto Uzumaki',subtitle:'The Will of Fire',image:'assets/naruto-cinematic.jpg'}
  ];
  var byId = function(id) { return document.getElementById(id); };
  var scene=byId('scene'), dock=byId('dock'), panel=byId('panel'), panelContent=byId('panelContent');
  var state = { favorites:['youtube','netflix','prime','hulu','peacock'], ids:{}, theme:'itachi' };
  try {
    var stored=JSON.parse(localStorage.getItem('sharinganTV-v03') || 'null');
    if(stored && typeof stored==='object') {
      if(Array.isArray(stored.favorites)) {
        state.favorites=stored.favorites.filter(function(k,i,a) {return catalog.some(function(c){return c.key===k;}) && a.indexOf(k)===i;}).slice(0,9);
      }
      if(stored.ids && typeof stored.ids==='object') state.ids=stored.ids;
      if(themes.some(function(t){return t.key===stored.theme;})) state.theme=stored.theme;
    }
  } catch(ignore) {}
  if (!state.ids.peacock || ['peacock','com.peacocktv.peacock'].indexOf(state.ids.peacock)>=0) state.ids.peacock='com.peacock.tv';
  function save() { try {localStorage.setItem('sharinganTV-v03',JSON.stringify(state));}catch(ignore){} }
  var region='dock', focusIndex=0, topIndex=0, panelType='', panelIndex=0, lastPanelFocus=null, toastTimer=0, activeBridge=null;
  function findApp(key) { for(var i=0;i<catalog.length;i++) if(catalog[i].key===key) return catalog[i]; return null; }
  function dockItems() { return state.favorites.map(findApp).filter(Boolean).concat([{key:'all',name:'All Apps',logo:'▦'}]); }
  function showToast(message,ms) {
    var t=byId('toast');t.textContent=message;t.classList.remove('hidden');clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){t.classList.add('hidden');},ms||7000);
  }
  function updateVisualFocus() {
    var items=dock.querySelectorAll('.tile');
    var chosen=items[focusIndex];
    var aura=byId('focusAura');
    if(chosen && region==='dock'){
      var b=chosen.getBoundingClientRect(), s=scene.getBoundingClientRect();
      var x=(b.left+b.width/2-s.left)/s.width*100;
      aura.style.left=x+'%'; aura.style.opacity='1';
      var rig=byId('eyeRig');
      // Eyes track focused app; in source-image pixels, scaled to actual TV resolution.
      // Limit motion to the painted eye opening (not a wandering glow over the cheek).
      var scale=Math.max(.5,window.innerWidth/1920);
      rig.style.setProperty('--lookX',(Math.max(-7,Math.min(7,(x-50)*.19))*scale).toFixed(2)+'px');
      rig.style.setProperty('--lookY',(2.5*scale).toFixed(2)+'px');
      scene.style.setProperty('--focusLightX',x+'%');
    } else aura.style.opacity='.3';
  }
  function focusDock(doFocus) {
    var buttons=dock.querySelectorAll('.tile');
    focusIndex=Math.max(0,Math.min(focusIndex,buttons.length-1));
    for(var i=0;i<buttons.length;i++) buttons[i].classList.toggle('selected',i===focusIndex);
    updateVisualFocus();
    if(doFocus!==false && buttons[focusIndex]) buttons[focusIndex].focus();
  }
  function focusTop(doFocus) {
    var buttons=byId('topActions').querySelectorAll('button');
    for(var i=0;i<buttons.length;i++) buttons[i].classList.toggle('active',i===topIndex);
    if(doFocus!==false && buttons[topIndex]) buttons[topIndex].focus();
  }
  function renderDock() {
    dock.innerHTML='';
    dockItems().forEach(function(app,index){
      var b=document.createElement('button');b.type='button';b.className='tile actionable';b.setAttribute('aria-label','Open '+app.name);
      b.setAttribute('data-key',app.key);
      var logo=document.createElement('span');logo.className='tileLogo logo-'+app.key;logo.innerHTML=app.logo;
      var title=document.createElement('span');title.className='tileLabel';title.textContent=app.name;
      b.appendChild(logo);b.appendChild(title);
      b.addEventListener('click',function(){region='dock';focusIndex=index;focusDock(false);activate(app);});
      b.addEventListener('focus',function(){region='dock';focusIndex=index;focusDock(false);});
      b.addEventListener('mouseenter',function(){if(region!=='panel'){region='dock';focusIndex=index;focusDock();}});
      dock.appendChild(b);
    });
    focusDock(false);
  }
  function setTheme(key) {
    var data=themes.filter(function(t){return t.key===key;})[0]; if(!data)return;
    state.theme=key;save();scene.className='theme-'+key;
    byId('eyeRig').style.display=['itachi','sasuke','kakashi','madara'].indexOf(key)>=0?'block':'none';
    byId('art').style.backgroundImage='url("'+data.image+'")';
    byId('character').textContent=data.title.toUpperCase();
    byId('tagline').textContent=data.subtitle.toUpperCase();
    updateVisualFocus();
  }
  function serviceCall(method,parameters,onSuccess,onFailure) {
    var uri='luna://com.webos.applicationManager';
    try {
      if(window.webOS && window.webOS.service && typeof window.webOS.service.request==='function') {
        window.webOS.service.request(uri,{method:method,parameters:parameters,onSuccess:onSuccess,onFailure:onFailure});return;
      }
      if(typeof window.PalmServiceBridge==='function') {
        var b=new window.PalmServiceBridge();activeBridge=b;
        b.onservicecallback=function(reply){
          var res;try{res=JSON.parse(reply);}catch(e){onFailure({errorText:'Unrecognized TV response: '+reply});return;}
          if(res.returnValue===false || res.errorCode) onFailure(res); else onSuccess(res);
        };
        b.call(uri+'/'+method,JSON.stringify(parameters));return;
      }
      onFailure({errorText:'webOS TV API unavailable: use the LG TV installation, not a desktop browser.'});
    }catch(e){onFailure({errorText:e.message||String(e)});}
  }
  function triggerEyePulse(){
    var el=byId('eyeRig');el.classList.remove('eyePulse');void el.offsetWidth;el.classList.add('eyePulse');
    setTimeout(function(){el.classList.remove('eyePulse');},760);
  }
  function launch(app) {
    triggerEyePulse();
    var override=(state.ids[app.key]||'').trim();
    var ids=override?[override]:app.ids;
    if(!ids || !ids.length){showToast('No application ID set for '+app.name+'.');return;}
    var attempt=0;
    function tryNext(){
      var id=ids[attempt++];
      showToast('Opening '+app.name+'…',4500);
      serviceCall('launch',{id:id},function(resp){
        if(resp && resp.returnValue===false){failed(resp);}
        // A successful service response normally switches to the launched app.
      },failed);
      function failed(err){
        if(attempt<ids.length){tryNext();return;}
        showToast('Could not launch '+app.name+' (ID: '+id+'). '+(err.errorText||err.message||JSON.stringify(err))+'. You can change its ID in Settings.',12000);
      }
    }
    tryNext();
  }
  function activate(app){ if(app.key==='all') openPanel('apps');else launch(app); }
  function panelItem(title,callback,selected,description){
    var b=document.createElement('button');b.type='button';b.className='panelItem actionable'+(selected?' active':'');
    var name=document.createElement('span');name.textContent=title;b.appendChild(name);
    if(description){var meta=document.createElement('span');meta.className='meta';meta.textContent=description;b.appendChild(meta);}
    b.addEventListener('click',callback);panelContent.appendChild(b);return b;
  }
  function para(text){var p=document.createElement('p');p.className='panelDescription';p.textContent=text;panelContent.appendChild(p);}
  function libraryEntry(app) {
    var row=document.createElement('div');row.className='libraryItem';
    var pinned=state.favorites.indexOf(app.key)!==-1;
    var launchBtn=document.createElement('button');launchBtn.type='button';launchBtn.className='panelItem actionable';
    launchBtn.textContent=app.name+'  ·  Open';launchBtn.onclick=function(){launch(app);};
    var pin=document.createElement('button');pin.type='button';pin.className='pinButton actionable';pin.textContent=pinned?'− Unpin':'+ Pin';
    pin.setAttribute('aria-label',(pinned?'Remove ':'Pin ')+app.name);
    pin.onclick=function(){
      var i=state.favorites.indexOf(app.key);
      if(i!==-1)state.favorites.splice(i,1);
      else if(state.favorites.length>=9){showToast('Maximum 9 favorites. Unpin another app first.');return;}
      else state.favorites.push(app.key);
      save();renderDock();openPanel('apps',app.key);
    };
    row.appendChild(launchBtn);row.appendChild(pin);panelContent.appendChild(row);
  }
  // Read-only diagnostics for Peacock. Does not request the restricted full app list.
  var peacockCandidates = [
    'com.peacocktv.peacock', 'peacock', 'com.peacocktv',
    'com.peacocktv.peacocktv', 'com.nbcuni.peacock',
    'com.nbcuniversal.peacock', 'com.peacock.app',
    'peacocktv', 'com.peacocktv.app'
  ];
  function peacockDiagnostic() {
    var title=document.createElement('h3');title.className='diagTitle';title.textContent='Peacock diagnostics';panelContent.appendChild(title);
    para('Check candidate application IDs on this TV. A match is only confirmed if webOS reports exist: true. This does not change or uninstall any apps.');
    var run=document.createElement('button');run.type='button';run.className='panelItem actionable';run.textContent='Check Peacock IDs';panelContent.appendChild(run);
    var result=document.createElement('div');result.className='diagResults';result.setAttribute('aria-live','polite');panelContent.appendChild(result);
    function output(message){var p=document.createElement('div');p.className='diagLine';p.textContent=message;result.appendChild(p);result.scrollTop=result.scrollHeight;}
    run.onclick=function(){
      result.textContent='';run.disabled=true;run.textContent='Checking…';
      var index=0,found=0;
      function next(){
        if(index>=peacockCandidates.length){output('Finished: '+found+' installed match(es).');run.disabled=false;run.textContent='Check Peacock IDs again';return;}
        var appId=peacockCandidates[index++];
        serviceCall('getAppLoadStatus',{appId:appId},function(resp){
          if(resp && resp.exist===true){
            found++;output('FOUND: '+appId);
            var save=document.createElement('button');save.type='button';save.className='panelItem actionable';save.textContent='Save '+appId+' as Peacock shortcut';
            save.onclick=function(){state.ids.peacock=appId;persistState();showToast('Peacock ID saved: '+appId,6000);};
            result.appendChild(save);
            var launchBtn=document.createElement('button');launchBtn.type='button';launchBtn.className='panelItem actionable';launchBtn.textContent='Try launching '+appId;
            launchBtn.onclick=function(){serviceCall('launch',{id:appId},function(r){output('Launch acknowledged: '+appId+' '+JSON.stringify(r));},function(e){output('Launch failed: '+appId+' '+JSON.stringify(e));});};
            result.appendChild(launchBtn);
          } else output('Not installed: '+appId+' (exist: '+String(resp && resp.exist)+')');
          next();
        },function(err){output('Error for '+appId+': '+JSON.stringify(err));next();});
      }
      next();
    };
  }
  function persistState(){save();}
  function settingsEntry(app) {
    var label=document.createElement('label');label.className='settingsLabel';label.textContent=app.name+' application ID';
    var wrap=document.createElement('div');wrap.className='settingsRow';
    var input=document.createElement('input');input.type='text';input.className='settingsInput actionable';
    input.value=state.ids[app.key]||app.ids[0]||'';input.setAttribute('aria-label',app.name+' application ID');
    var btn=document.createElement('button');btn.type='button';btn.className='saveButton actionable';btn.textContent='Save';
    btn.onclick=function(){state.ids[app.key]=input.value.trim();save();showToast('Saved app ID for '+app.name+'.',3500);};
    wrap.appendChild(input);wrap.appendChild(btn);panelContent.appendChild(label);panelContent.appendChild(wrap);
  }
  function getFocusable(){return Array.prototype.slice.call(panel.querySelectorAll('button,input'));}
  function focusPanel(index){
    var list=getFocusable();if(!list.length)return;
    panelIndex=((index%list.length)+list.length)%list.length;
    list[panelIndex].focus();
  }
  function openPanel(type,restoreKey){
    region='panel';panelType=type;panelContent.innerHTML='';
    byId('panelTitle').textContent=type==='themes'?'Themes':type==='apps'?'App Library':'Settings';
    if(type==='themes'){
      para('Choose a character. Every theme has its own artwork and color palette.');
      themes.forEach(function(t){panelItem((t.key===state.theme?'✓  ':'')+t.title,function(){setTheme(t.key);openPanel('themes',t.key);},t.key===state.theme,t.key===state.theme?'ACTIVE':'');});
    }else if(type==='apps'){
      para('Curated shortcuts, not an automatic list of every installed TV app. Tap a name to launch, or pin it to the dock.');
      catalog.forEach(libraryEntry);
    }else{
      para('YouTube launching was confirmed on this LG C3. Other streaming app IDs may differ. If a tile fails, update its app ID here using the TV keyboard.');
      peacockDiagnostic();
      catalog.forEach(settingsEntry);
    }
    byId('backdrop').classList.remove('hidden');panel.classList.remove('hidden');
    // Focus an item so D-pad navigation works even without the Magic Remote pointer.
    var list=getFocusable(), target=1;
    if(restoreKey){
      if(type==='themes') target=1+themes.findIndex(function(t){return t.key===restoreKey;});
      if(type==='apps') target=1+catalog.findIndex(function(a){return a.key===restoreKey;})*2;
    }
    focusPanel(Math.max(0,Math.min(target,list.length-1)));
  }
  function closePanel(){panel.classList.add('hidden');byId('backdrop').classList.add('hidden');panelType='';region='dock';focusDock();}
  document.querySelectorAll('[data-command]').forEach(function(b){
    b.addEventListener('click',function(){if(b.getAttribute('data-command')==='close') closePanel();else openPanel(b.getAttribute('data-command'));});
  });
  byId('backdrop').addEventListener('click',closePanel);
  function keyName(e){var k=e.key||'';if(k)return k;return ({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter',27:'Escape',8:'Backspace',461:'Backspace'})[e.keyCode]||'';}
  document.addEventListener('keydown',function(e){
    var k=keyName(e), isBack=k==='Escape'||k==='Backspace'||e.keyCode===461;
    if(isBack) {
      // LG remote Back may use keyCode 461; avoid default exit confirmation
      // while handling in-app navigation. Main screen Back re-focuses dock.
      e.preventDefault(); e.stopPropagation();
      if (typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
      if(region==='panel') closePanel();
      else if(region==='top'){region='dock';focusDock();}
      else {region='dock';focusDock();showToast('Launcher home · use the Home key to return to LG Home.',2800);}
      return;
    }
    if(region==='panel'){
      if(document.activeElement && document.activeElement.tagName==='INPUT'){
        // Allow the native input/IME to handle typing and left/right cursor movement.
        if(k==='ArrowDown'){e.preventDefault();focusPanel(panelIndex+1);}else if(k==='ArrowUp'){e.preventDefault();focusPanel(panelIndex-1);}
        return;
      }
      if(k==='ArrowDown'||k==='ArrowRight'){e.preventDefault();focusPanel(panelIndex+1);}
      else if(k==='ArrowUp'||k==='ArrowLeft'){e.preventDefault();focusPanel(panelIndex-1);}
      else if(k==='Enter'){e.preventDefault();var active=getFocusable()[panelIndex];if(active)active.click();}
      return;
    }
    if(k==='ArrowLeft'){e.preventDefault();if(region==='top'){topIndex=(topIndex+1)%2;focusTop();}else{focusIndex=(focusIndex+dockItems().length-1)%dockItems().length;region='dock';focusDock();}}
    else if(k==='ArrowRight'){e.preventDefault();if(region==='top'){topIndex=(topIndex+1)%2;focusTop();}else{focusIndex=(focusIndex+1)%dockItems().length;region='dock';focusDock();}}
    else if(k==='ArrowUp'){e.preventDefault();region='top';focusTop();}
    else if(k==='ArrowDown'){e.preventDefault();if(region==='top'){region='dock';focusDock();}else openPanel('apps');}
    else if(k==='Enter'){e.preventDefault();if(region==='top')byId('topActions').querySelectorAll('button')[topIndex].click();else activate(dockItems()[focusIndex]);}
  });
  // Browser-history fallback for Back implementations which dispatch popstate.
  try {
    window.history.replaceState({sharingan:true},'','#launcher');
    window.history.pushState({sharinganGuard:true},'','#launcher-home');
    window.addEventListener('popstate',function(){
      if(region==='panel') closePanel();
      else {region='dock';focusDock();}
      window.history.pushState({sharinganGuard:true},'','#launcher-home');
    });
  }catch(ignore){}
  byId('topActions').querySelectorAll('button').forEach(function(b,i){b.addEventListener('focus',function(){if(region!=='panel'){region='top';topIndex=i;focusTop(false);}});});
  panel.addEventListener('focusin',function(e){if(region==='panel'){var i=getFocusable().indexOf(e.target);if(i!==-1)panelIndex=i;}});

  // Odometer strips contain 0..9 twice, permitting a true animated 9 -> 0 rollover.
  var digitHeight=6.8, digits=[],lastText='';
  function setupClock(){
    var clock=byId('clock');clock.innerHTML='';digits=[];
    for(var i=0;i<4;i++){
      if(i===2){var colon=document.createElement('span');colon.className='clockColon';colon.textContent=':';clock.appendChild(colon);}
      var viewport=document.createElement('div');viewport.className='clockDigit';
      var strip=document.createElement('div');strip.className='numberStrip';
      for(var j=0;j<20;j++){var n=document.createElement('div');n.className='clockNumber';n.textContent=(j%10).toString();strip.appendChild(n);}
      viewport.appendChild(strip);clock.appendChild(viewport);
      digits.push({strip:strip,value:null,resetTimer:null});
    }
  }
  function setDigit(obj,newValue){
    if(obj.value===null){obj.strip.style.transition='none';obj.strip.style.transform='translateY(-'+(newValue*digitHeight)+'vw)';obj.strip.offsetHeight;obj.strip.style.transition='';obj.value=newValue;return;}
    if(obj.value===newValue)return;
    clearTimeout(obj.resetTimer);
    if(obj.value===9 && newValue===0){
      obj.strip.style.transition='transform .58s cubic-bezier(.18,.68,.18,1)';
      obj.strip.style.transform='translateY(-'+(10*digitHeight)+'vw)';
      obj.resetTimer=setTimeout(function(){obj.strip.style.transition='none';obj.strip.style.transform='translateY(0vw)';obj.strip.offsetHeight;obj.strip.style.transition='';},700);
    }else{
      obj.strip.style.transition='transform .58s cubic-bezier(.18,.68,.18,1)';
      obj.strip.style.transform='translateY(-'+(newValue*digitHeight)+'vw)';
    }
    obj.value=newValue;
  }
  function updateClock(){
    var now=new Date(),hours=('0'+now.getHours()).slice(-2),minutes=('0'+now.getMinutes()).slice(-2),str=hours+minutes;
    if(str!==lastText){for(var i=0;i<4;i++)setDigit(digits[i],Number(str.charAt(i)));lastText=str;}
    byId('date').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
  }
  scene.addEventListener('mousemove',function(e){
    if(region==='panel')return;
    var rect=scene.getBoundingClientRect();
    var scale=Math.max(.5,window.innerWidth/1920);
    var dx=Math.max(-7,Math.min(7,((e.clientX-rect.left)/rect.width-.5)*14))*scale;
    var dy=Math.max(-4,Math.min(4,((e.clientY-rect.top)/rect.height-.5)*8))*scale;
    byId('eyeRig').style.setProperty('--lookX',dx.toFixed(2)+'px');
    byId('eyeRig').style.setProperty('--lookY',dy.toFixed(2)+'px');
  });
  setTheme(state.theme);renderDock();setupClock();updateClock();setInterval(updateClock,1000);
  setTimeout(function(){region='dock';focusDock();},120);
  // Simple browser test hooks, ignored by the TV runtime.
  window.SharinganTest={theme:function(){return state.theme;},favorites:function(){return state.favorites.slice();},openPanel:openPanel,dockItems:dockItems};
})();
