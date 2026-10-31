(function(){
  var registered=false;
  function back(){
    try{
      var ov=document.getElementById('modalOverlay');
      if(ov&&!ov.classList.contains('hidden')){
        // Preserve the modal's unsaved-changes guard.
        if(typeof window.closeModal==='function')window.closeModal();
        return;
      }
      if(typeof window.goBack==='function' && typeof pageStack!=='undefined' && pageStack.length){
        window.goBack(); return;
      }
      if(typeof currentPage!=='undefined'&&currentPage!=='dashboard'){
        if(typeof window.navigate==='function')window.navigate('dashboard',{},false);
        return;
      }
      var app=window.Capacitor?.Plugins?.App;
      if(app&&typeof app.exitApp==='function')app.exitApp();
    }catch(e){console.error('Winzera back handler:',e);}
  }
  window.winzeraNativeBack=function(){back();return true;};
  function register(){
    if(registered || !window.Capacitor?.isNativePlatform?.())return false;
    var app=window.Capacitor?.Plugins?.App;
    if(!app||typeof app.addListener!=='function')return false;
    registered=true;
    try{
      Promise.resolve(app.addListener('backButton',back)).catch(function(e){
        registered=false;console.error('Winzera back listener failed:',e);
      });
    }catch(e){registered=false;console.error('Winzera back registration failed:',e);}
    return registered;
  }
  // The script is inserted at the beginning of HEAD. Capacitor's bridge may
  // not yet exist; register again after document load and app resume.
  register();
  document.addEventListener('DOMContentLoaded',register);
  window.addEventListener('load',register);
  document.addEventListener('resume',register);
  document.addEventListener('deviceready',register);
})();