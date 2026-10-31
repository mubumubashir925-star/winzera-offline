(function(){
  if(!window.Capacitor?.isNativePlatform?.())return;
  var App=window.Capacitor.Plugins?.App;
  function back(){
    try{
      var ov=document.getElementById('modalOverlay');
      if(ov&&!ov.classList.contains('hidden')){
        if(typeof window.closeModal==='function')window.closeModal();
        return;
      }
      if(typeof pageStack!=='undefined'&&pageStack.length>0){
        if(typeof window.goBack==='function')window.goBack();
        return;
      }
      if(typeof currentPage!=='undefined'&&currentPage!=='dashboard'){
        if(typeof window.navigate==='function')window.navigate('dashboard',{},false);
        return;
      }
      // Only Dashboard with no open modal is allowed to exit.
      if(App&&typeof App.exitApp==='function')App.exitApp();
    }catch(e){console.error('Winzera back handler:',e);}
  }
  window.winzeraNativeBack=function(){back();return true;};
  if(App&&typeof App.addListener==='function'){
    App.addListener('backButton',function(){back();}).catch(function(e){
      console.error('Capacitor App backButton listener failed:',e);
    });
  }else{
    console.warn('Capacitor App plugin missing; Android back gestures cannot be intercepted');
  }
})();