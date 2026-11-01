/* Winzera professional dashboard v2: UI only; all data stays in the existing DB. */
(function(){
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.renderDashboard=function(){
 const cfg=DB.config(),teams=DB.teams(),participants=DB.participants(),items=DB.items(),marks=DB.marks();
 const declared=items.filter(i=>i.declared).length,pending=Math.max(0,items.length-declared);
 const links=[['⚙️','Setup','Event settings','setup'],['👥','Teams','Manage teams','teams'],['🎓','Participants','View & add','participants'],['🏆','Items','Competition items','items'],['✍️','Mark Entry','Enter scores','marks'],['📊','Results','View results','results'],['🗂️','Sections','Categories','sections'],['🖨️','Reports','Print & export','reports']];
 const stats=[['👥','Teams',teams.length,'purple'],['🎓','Participants',participants.length,'blue'],['🏆','Items',items.length,'orange'],['⏳','Pending',pending,'pink']];
 return `<section class="wz-pro-home">
 <div class="wz-pro-hero"><div class="wz-pro-eyebrow">✦ WINZERA · EVENT MANAGER</div><h1>${esc(cfg.festName||'Your Competition')}</h1><p>${esc(cfg.institution||'Manage your competition with confidence')}</p><div class="wz-pro-event-meta">📅 ${esc(typeof formatFestDate==='function'?(formatFestDate(cfg)||'Event dashboard'):'Event dashboard')}${cfg.venue?' · '+esc(cfg.venue):''}</div><div class="wz-pro-hero-orb"></div></div>
 <div class="wz-pro-section-title"><span>Event at a glance</span><span class="wz-pro-section-hint">LIVE OVERVIEW</span></div>
 <div class="wz-pro-stats">${stats.map(([ico,label,value,color])=>`<div class="wz-pro-stat wz-pro-${color}"><span class="wz-pro-stat-icon">${ico}</span><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
 <div class="wz-pro-section-title"><span>Quick Actions</span><span class="wz-pro-section-hint">EXPLORE ALL</span></div>
 <div class="wz-pro-actions">${links.map(([ico,label,sub,page])=>`<button type="button" class="wz-pro-action" onclick="navigate('${page}')"><span class="wz-pro-action-icon">${ico}</span><strong>${label}</strong><small>${sub}</small></button>`).join('')}</div>
 <div class="wz-pro-section-title"><span>Event Overview</span></div>
 <div class="wz-pro-overview"><div class="wz-pro-overview-head"><span>🏅 Competition progress</span><strong>${items.length?Math.round(declared/items.length*100):0}%</strong></div><div class="wz-pro-track"><div style="width:${items.length?Math.round(declared/items.length*100):0}%"></div></div><div class="wz-pro-overview-foot"><span>${declared} declared</span><span>${items.length} total items</span></div></div>
 <div class="wz-pro-section-title"><span>Today's Summary</span></div>
 <div class="wz-pro-summary"><div><span>✓</span><strong>${declared}</strong><small>Declared results</small></div><div><span>◷</span><strong>${pending}</strong><small>Items pending</small></div><div><span>★</span><strong>${marks.length}</strong><small>Mark records</small></div></div>
 </section>`;
};
})();
