/* Winzera Neo dashboard: approved visual layout, existing offline DB and navigation. */
(function(){
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={teams:'👥',participants:'🪪',items:'📚',assign:'🗂️',marks:'📋',results:'🏆',points:'📊',backup:'☁️'};
window.renderDashboard=function(){
 const cfg=DB.config(),teams=DB.teams(),people=DB.participants(),items=DB.items();
 const done=items.filter(i=>i.declared).length,remaining=items.length-done,pct=items.length?Math.round(done/items.length*100):0;
 const shortcuts=[['teams','Teams','teams'],['participants','Participants','participants'],['items','Items','items'],['assign','Assign Items','participants'],['marks','Mark Entry','marks'],['results','Results','results'],['points','Points','points'],['backup','Backup','reports']];
 const stats=[['👥',teams.length,'Teams','violet'],['👤',people.length,'Participants','sky'],['☷',items.length,'Items','peach'],['🏅',done,'Completed','mint']];
 return `<section class="wz-neo">
 <div class="wz-neo-banner"><div class="wz-neo-spark">✦ EVENT DASHBOARD</div><div class="wz-neo-banner-body"><div><h1>${esc(cfg.festName||'Winzera Fest')}</h1><p>${esc(cfg.institution||'Competition Management')}</p></div><div class="wz-neo-trophy" aria-hidden="true">🏆</div></div><div class="wz-neo-banner-footer"><span>📅 ${esc(typeof formatFestDate==='function'?(formatFestDate(cfg)||'Event details'):'Event details')}</span><span>📍 ${esc(cfg.venue||'Event Venue')}</span></div></div>
 <div class="wz-neo-statgrid">${stats.map(([icon,value,label,tone])=>`<div class="wz-neo-stat ${tone}"><div class="wz-neo-stat-icon">${icon}</div><div><strong>${value}</strong><span>${label}</span></div></div>`).join('')}</div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Competition Progress</h2><strong>${pct}%</strong></div><div class="wz-neo-track"><div style="width:${pct}%"></div></div><div class="wz-neo-progress-info"><span>🟢 ${done} Done</span><span>▷ ${remaining} Pending</span><span>◷ ${items.length} Total</span></div></div>
 <div class="wz-neo-panel wz-neo-quick"><div class="wz-neo-panel-head"><h2>Quick Actions</h2><span class="wz-neo-muted">Manage event</span></div><div class="wz-neo-actiongrid">${shortcuts.map(([id,label,page])=>`<button type="button" class="wz-neo-action" onclick="navigate('${page}')"><span class="wz-neo-action-icon ${id}">${icons[id]}</span><span>${label}</span></button>`).join('')}</div></div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Event Overview</h2></div><div class="wz-neo-overview">
 <button type="button" onclick="navigate('teamPoints')"><span>🏆</span> Team Points <b>›</b></button>
 <button type="button" onclick="navigate('results')"><span>⭐</span> Individual Results <b>›</b></button>
 <button type="button" onclick="navigate('points')"><span>👥</span> Group Results &amp; Points <b>›</b></button>
 <button type="button" onclick="navigate('reports')"><span>🎖️</span> Reports &amp; Certificates <b>›</b></button>
 </div></div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Tools &amp; Maintenance</h2></div><div class="wz-neo-tools"><button type="button" onclick="navigate('reports')">💾<span>Backup &amp; Export</span></button><button type="button" onclick="navigate('setup')">⚙️<span>Settings</span></button><button type="button" onclick="if(typeof window._doCheckUpdate==='function')window._doCheckUpdate();else alert('Update checker is available in the Android app')">🔄<span>Check Updates</span></button></div></div>
 </section>`;
};
})();
