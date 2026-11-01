/* Tie-safe Public Podium: preserve every joint winner and their original rank. */
(function(){
 const original=window._pvResultPosterHtml;
 if(typeof original!=='function')return;
 window._pvResultPosterHtml=function(p,badgeStyle){
  const html=original.apply(this,arguments);
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const podium=tpl.content.querySelector('.pv-podium');
  if(!podium)return html;
  const slots=Array.from(podium.querySelectorAll(':scope > .pv-podium-slot'));
  if(!slots.length)return html;
  const groups=new Map();
  slots.forEach(slot=>{
   const match=Array.from(slot.classList).find(c=>/^pv-podium-[123]$/.test(c));
   const rank=match?match.slice(-1):'other';
   if(!groups.has(rank))groups.set(rank,[]);
   groups.get(rank).push(slot);
  });
  podium.replaceChildren();
  ['1','2','3','other'].forEach(rank=>{
   const winners=groups.get(rank);
   if(!winners?.length)return;
   const group=document.createElement('div');
   group.className='pv-rank-group pv-rank-group-'+rank+(winners.length>1?' pv-rank-tied':'');
   if(winners.length>1){
    const label=document.createElement('div');
    label.className='pv-tie-label';
    label.textContent='JOINT '+({1:'FIRST',2:'SECOND',3:'THIRD'}[rank]||'POSITION')+' · '+winners.length+' WINNERS';
    group.appendChild(label);
   }
   const cards=document.createElement('div');cards.className='pv-rank-cards';
   winners.forEach(slot=>cards.appendChild(slot));
   group.appendChild(cards);podium.appendChild(group);
  });
  return tpl.innerHTML;
 };
})();
