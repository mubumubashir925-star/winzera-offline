/* Winzera Neo dashboard: approved visual layout, existing offline DB and navigation. */
(function(){
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 teams:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 participants:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M5.5 16a4 4 0 0 1 7 0M15 9h4M15 13h4"/>',
 items:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M9 7h6M9 11h6"/>',
 assign:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 15l2 2 5-5"/>',
 marks:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 3.5h6M9 12l2 2 4-4M9 18h6"/>',
 results:'<path d="M8 21h8M12 17v4M7 4h10v7a5 5 0 0 1-10 0V4ZM7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/>',
 points:'<path d="M4 20V11M10 20V5M16 20v-8M22 20V8"/><path d="M2 20h22"/>',
 backup:'<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6M4 13a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/>',
 star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1Z"/>',
 medal:'<circle cx="12" cy="15" r="5"/><path d="m8 11-3-8h5l2 7 2-7h5l-3 8"/>'
};
const ico=name=>'<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.star)+'</svg>';
const icons=Object.fromEntries(['teams','participants','items','assign','marks','results','points','backup'].map(k=>[k,ico(k)]));
window.renderDashboard=function(){
 const cfg=DB.config(),teams=DB.teams(),people=DB.participants(),items=DB.items();
 const done=items.filter(i=>i.declared).length,remaining=items.length-done,pct=items.length?Math.round(done/items.length*100):0;
 const shortcuts=[['teams','Teams','teams'],['participants','Participants','participants'],['items','Items','items'],['assign','Assign Items','participants'],['marks','Mark Entry','marks'],['results','Results','results'],['points','Points','points'],['backup','Backup','reports']];
 const stats=[[ico('teams'),teams.length,'Teams','violet'],[ico('participants'),people.length,'Participants','sky'],[ico('items'),items.length,'Items','peach'],[ico('medal'),done,'Completed','mint']];
 return `<section class="wz-neo">
 <div class="wz-neo-banner"><div class="wz-neo-spark">✦ EVENT DASHBOARD</div><div class="wz-neo-banner-body"><div><h1>${esc(cfg.festName||'Winzera Fest')}</h1><p>${esc(cfg.institution||'Competition Management')}</p></div><div class="wz-neo-trophy" aria-hidden="true">${ico("results")}</div></div><div class="wz-neo-banner-footer"><span>${ico("calendar")} ${esc(typeof formatFestDate==='function'?(formatFestDate(cfg)||'Event details'):'Event details')}</span><span>${ico("pin")} ${esc(cfg.venue||'Event Venue')}</span></div></div>
 <div class="wz-neo-statgrid">${stats.map(([icon,value,label,tone])=>`<div class="wz-neo-stat ${tone}"><div class="wz-neo-stat-icon">${icon}</div><div><strong>${value}</strong><span>${label}</span></div></div>`).join('')}</div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Competition Progress</h2><strong>${pct}%</strong></div><div class="wz-neo-track"><div style="width:${pct}%"></div></div><div class="wz-neo-progress-info"><span>${ico("check")} ${done} Done</span><span>${ico("clock")} ${remaining} Pending</span><span>${ico("items")} ${items.length} Total</span></div></div>
 <div class="wz-neo-panel wz-neo-quick"><div class="wz-neo-panel-head"><h2>Quick Actions</h2><span class="wz-neo-muted">Manage event</span></div><div class="wz-neo-actiongrid">${shortcuts.map(([id,label,page])=>`<button type="button" class="wz-neo-action" onclick="navigate('${page}')"><span class="wz-neo-action-icon ${id}">${icons[id]}</span><span>${label}</span></button>`).join('')}</div></div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Event Overview</h2></div><div class="wz-neo-overview">
 <button type="button" onclick="navigate('teamPoints')"><span>${ico("results")}</span> Team Points <b>›</b></button>
 <button type="button" onclick="navigate('results')"><span>${ico("star")}</span> Individual Results <b>›</b></button>
 <button type="button" onclick="navigate('points')"><span>${ico("teams")}</span> Group Results &amp; Points <b>›</b></button>
 <button type="button" onclick="navigate('reports')"><span>${ico("medal")}</span> Reports &amp; Certificates <b>›</b></button>
 </div></div>
 <div class="wz-neo-panel"><div class="wz-neo-panel-head"><h2>Tools &amp; Maintenance</h2></div><div class="wz-neo-tools"><button type="button" onclick="navigate('reports')">${ico("backup")}<span>Backup &amp; Export</span></button><button type="button" onclick="navigate('setup')">${ico("settings")}<span>Settings</span></button><button type="button" onclick="if(typeof window._doCheckUpdate==='function')window._doCheckUpdate();else alert('Update checker is available in the Android app')">${ico("refresh")}<span>Check Updates</span></button></div></div>
 </section>`;
};
})();
