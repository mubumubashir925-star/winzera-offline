(function(){
  window.winzeraNativeBack=function(){
    try{
      var modal=document.getElementById('modalOverlay');
      if(modal&&!modal.classList.contains('hidden')){
        if(typeof window.closeModal==='function')window.closeModal();
        return true;
      }
      // Native back must not use WebView browser history; the app already
      // maintains its own pageStack and goBack() guards unsaved changes.
      if(typeof pageStack!=='undefined'&&pageStack.length>0){
        if(typeof window.goBack==='function')window.goBack();
        return true;
      }
      if(typeof currentPage!=='undefined'&&currentPage!=='dashboard'){
        if(typeof window.navigate==='function')window.navigate('dashboard',{},false);
        return true;
      }
      return false;
    }catch(e){console.error('Native back navigation:',e);return true;}
  };
})();