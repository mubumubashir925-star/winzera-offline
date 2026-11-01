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
    // Searchable select results must appear above the modal content rather
    // than being clipped under its footer on short Android screens.
    overlay.addEventListener('focusin',function(e){
      var input=e.target;
      if(!input||!input.id||!input.id.endsWith('_q'))return;
      var result=document.getElementById(input.id.slice(0,-2)+'_res');
      if(!result)return;
      requestAnimationFrame(function(){
        var box=overlay.querySelector('.modal');
        if(!box)return;
        var roomBelow=box.getBoundingClientRect().bottom-input.getBoundingClientRect().bottom;
        var roomAbove=input.getBoundingClientRect().top-box.getBoundingClientRect().top;
        if(roomBelow<190&&roomAbove>roomBelow){
          result.style.top='auto';result.style.bottom='100%';result.style.marginTop='0';result.style.marginBottom='4px';
        }else{
          result.style.bottom='auto';result.style.top='100%';result.style.marginBottom='0';result.style.marginTop='4px';
        }
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();