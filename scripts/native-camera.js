/* Native Android/iOS camera bridge.
   The browser getUserMedia path remains unchanged for PWA/web.
   On Android, use the native camera app and its permission flow. */
(function(){
  function install(){
    if(!window.Capacitor?.isNativePlatform?.())return;
    var camera=window.Capacitor?.Plugins?.Camera;
    if(!camera||typeof camera.getPhoto!=='function')return;
    if(typeof window._startCamera!=='function')return;
    // QR scanner uses WebView getUserMedia; request the Android runtime camera
    // permission via the native Capacitor plugin before starting that stream.
    if(typeof window._startQRCamera==='function'&&!window._wzNativeQRPermissionInstalled){
      window._wzNativeQRPermissionInstalled=true;
      var originalQR=window._startQRCamera;
      window._startQRCamera=function(facingMode,onComplete){
        var token=window._qrScanToken;
        Promise.resolve(typeof camera.requestPermissions==='function'?camera.requestPermissions({permissions:['camera']}):null)
          .then(function(status){
            if(status&&status.camera!=='granted'&&status.camera!=='limited')throw new Error('Camera permission denied');
            if(token!==window._qrScanToken)return;
            originalQR(facingMode,onComplete);
          })
          .catch(function(err){
            console.warn('[Winzera] QR camera permission:',err);
            if(typeof window.toast==='function')window.toast('Allow Camera permission in Android Settings to scan QR codes. Paste Code is also available.','error');
            var el=document.getElementById('qrScanStatus');
            if(el)el.textContent='Camera permission required. Use Paste code instead, or enable Camera in Android Settings.';
          });
      };
    }
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