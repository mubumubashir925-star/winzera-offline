/* Native Android/iOS camera bridge.
   The browser getUserMedia path remains unchanged for PWA/web.
   On Android, use the native camera app and its permission flow. */
(function(){
  function install(){
    if(!window.Capacitor?.isNativePlatform?.())return;
    var camera=window.Capacitor?.Plugins?.Camera;
    if(!camera||typeof camera.getPhoto!=='function')return;
    if(typeof window._startCamera!=='function')return;
    if(window._wzNativeCameraInstalled)return;
    window._wzNativeCameraInstalled=true;
    window._startCamera=function(){
      if(window._wzCameraBusy)return;
      window._wzCameraBusy=true;
      camera.getPhoto({quality:85,allowEditing:false,resultType:'dataUrl',source:'CAMERA',correctOrientation:true})
        .then(function(photo){
          if(!photo||!photo.dataUrl)throw new Error('Camera returned no photo');
          if(typeof window.closeModal==='function')window.closeModal();
          setTimeout(function(){
            if(typeof window._openPhotoCropper==='function')window._openPhotoCropper(photo.dataUrl);
          },180);
        })
        .catch(function(err){
          var msg=String(err?.message||err||'');
          if(/cancel|dismiss|back/i.test(msg)){
            if(typeof window.closeModal==='function')window.closeModal();
            return;
          }
          console.error('[Winzera] Native camera:',err);
          if(typeof window.toast==='function')window.toast('Camera unavailable. Please allow Camera permission in Android Settings or select a gallery photo.','error');
          if(typeof window.closeModal==='function')window.closeModal();
        })
        .finally(function(){window._wzCameraBusy=false;});
    };
  }
  install();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  window.addEventListener('load',install);
})();