/* Winzera Android modal layout and duplicate-close policy.
   Hide only the top X when the same modal already has a bottom Close action.
   No action or event handler is removed. */
(function(){
  function normalize(){
    var overlay=document.getElementById('modalOverlay');
    var modal=document.getElementById('modalContent');
    if(!overlay||!modal||overlay.classList.contains('hidden'))return;
    var top=modal.querySelector('.modal-close-btn');
    if(!top)return;
    var bottom=Array.from(modal.querySelectorAll('button')).some(function(b){
      if(b===top||top.contains(b))return false;
      var label=(b.textContent||'').replace(/[×✕✖]/g,'').trim().toLowerCase();
      return label==='close';
    });
    top.classList.toggle('wz-duplicate-close',bottom);
  }
  function init(){
    var overlay=document.getElementById('modalOverlay');
    if(!overlay)return;
    var scheduled=false;
    function schedule(){
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(function(){scheduled=false;normalize();});
    }
    var observer=new MutationObserver(schedule);
    observer.observe(overlay,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();