/* Synchronize Android status bar with Winzera light/dark theme. */
(function(){
 if(!window.Capacitor?.isNativePlatform?.())return;
 const bar=window.Capacitor.Plugins?.StatusBar;
 if(!bar)return;
 let last='';
 async function sync(){
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  const next=dark?'dark':'light';
  if(next===last)return;last=next;
  try{
   await bar.setOverlaysWebView({overlay:false});
   await bar.setBackgroundColor({color:dark?'#1a0a2e':'#f6f3ff'});
   await bar.setStyle({style:dark?'LIGHT':'DARK'});
  }catch(e){console.warn('Status bar theme sync failed',e);}
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',dark?'#1a0a2e':'#f6f3ff');
 }
 const observer=new MutationObserver(sync);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last='';sync();}});
})();
