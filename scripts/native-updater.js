(function () {
  if (!window.Capacitor || !window.Capacitor.isNativePlatform || !window.Capacitor.isNativePlatform()) return;
  const CURRENT_VERSION = '1.0.1';
  const API = 'https://api.github.com/repos/mubumubashir925-star/winzera-offline/releases/latest';
  function version(v) { return String(v).replace(/^v/i,'').split('.').map(n => parseInt(n,10)||0); }
  function newer(a,b) { const x=version(a),y=version(b); for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0);}return false; }
  async function check() {
    if (!navigator.onLine) { alert('Internet connection is required to check for updates.'); return; }
    try {
      const response=await fetch(API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
      if(response.status===404){alert('No mobile APK release is published yet.');return;}
      if(!response.ok)throw Error('GitHub response '+response.status);
      const release=await response.json();
      const apk=(release.assets||[]).find(a=>/\\.apk$/i.test(a.name));
      if(!newer(release.tag_name,CURRENT_VERSION)){alert('Winzera is up to date (v'+CURRENT_VERSION+').');return;}
      if(!apk){alert('New version '+release.tag_name+' exists, but no APK has been attached.');return;}
      if(!confirm('Winzera '+release.tag_name+' is available. Backup your data before updating. Download APK now?'))return;
      const url=apk.browser_download_url;
      if(window.Capacitor.Plugins?.Browser)await window.Capacitor.Plugins.Browser.open({url});
      else window.location.href=url;
    } catch(e) { alert('Could not check updates. Please try again with internet.'); console.warn(e); }
  }
  document.addEventListener('click',function(event){
    const button=event.target.closest('button,a,[role="button"]');
    if(!button)return;
    const text=(button.innerText||button.textContent||'').trim().toLowerCase();
    if(/check\\s+for\\s+updates?/.test(text)){
      event.preventDefault();event.stopImmediatePropagation();check();
    }
  },true);
  window.winzeraCheckNativeUpdates=check;
})();
