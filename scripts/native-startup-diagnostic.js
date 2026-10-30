(function(){
  if(!window.Capacitor || !window.Capacitor.isNativePlatform || !window.Capacitor.isNativePlatform()) return;
  var errors=[], started=Date.now(), panel=null;
  function note(s){if(errors.length<8)errors.push(String(s).slice(0,240));}
  window.addEventListener('error',function(e){note('JavaScript: '+(e.message||'unknown')+' @ '+(e.lineno||'?'));});
  window.addEventListener('unhandledrejection',function(e){note('Promise: '+(e.reason&&e.reason.message||e.reason||'unknown'));});
  function show(){
    if(panel || document.getElementById('wz-native-diagnostic'))return;
    var app=document.getElementById('app'),login=document.getElementById('loginScreen');
    if((app&&getComputedStyle(app).display!=='none')||(login&&getComputedStyle(login).display!=='none'))return;
    panel=document.createElement('div');panel.id='wz-native-diagnostic';
    panel.style.cssText='position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#100d22;color:#fff;padding:80px 24px 35px;font:15px/1.6 system-ui,sans-serif';
    var title=document.createElement('h2');title.textContent='Winzera startup diagnostic';panel.appendChild(title);
    var msg=document.createElement('p');msg.textContent='The app has not opened after 12 seconds. Your saved data has not been cleared.';panel.appendChild(msg);
    var log=document.createElement('pre');log.style.cssText='white-space:pre-wrap;word-break:break-word;padding:12px;border:1px solid #685b88;border-radius:10px';
    log.textContent=errors.length?errors.join('\n'):'No JavaScript error captured. Startup may be blocked before navigation.';
    panel.appendChild(log);
    var btn=document.createElement('button');btn.textContent='Retry opening app';btn.style.cssText='padding:12px 18px;background:#e8a32c;border:0;border-radius:9px;font-weight:700';btn.onclick=function(){location.reload()};panel.appendChild(btn);
    document.body.appendChild(panel);
  }
  setTimeout(show,12000);
})();