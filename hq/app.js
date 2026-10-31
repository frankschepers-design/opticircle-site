// Opticircle Command Center. Passcode gate is a convenience lock, not security (no sensitive data here).
const PASS_SHA256 = 'e776ca14d17428422226dc33e106eafc2915c343e02196aaf5b94d0995ab870b';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num = v => v === null || v === undefined || v === '' ? null : Number(v);
const fmt = v => num(v) === null ? '—' : Number(v).toLocaleString('en-US', {maximumFractionDigits: 0});
const usd = v => num(v) === null ? '—' : 'USD ' + fmt(v);
const dfmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : '—';
const na = (v, f = fmt) => num(v) === null ? '<span class="na">—</span>' : f(v);

async function sha(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function gate() {
  if (localStorage.getItem('hq_ok') === PASS_SHA256) return open_();
  $('#gate').hidden = false;
  $('#gateForm').onsubmit = async e => { e.preventDefault();
    if (await sha($('#pass').value.trim().toLowerCase()) === PASS_SHA256) { localStorage.setItem('hq_ok', PASS_SHA256); open_(); } else $('#gateErr').hidden = false; };
}
function open_() { $('#gate').hidden = true; $('#app').hidden = false; load(); }

async function load() {
  let d;
  try { d = await (await fetch('data.json?t=' + Date.now(), {cache: 'no-store'})).json(); }
  catch (e) { $('#main').innerHTML = '<div class="card empty"><b>Offline</b>No data cached yet.</div>'; return; }
  render(d);
}

const SECTIONS = [['today', 'Today'], ['channels', 'Channels'], ['posts', 'Posts'], ['growth', 'Growth'], ['invites', 'Invites'], ['leads', 'Leads'], ['revenue', 'Revenue'], ['traffic', 'Traffic']];
const ICO = {web: 'WEB', li_company: 'in', li_frank: 'in', fb: 'f', ig: 'IG', gbp: 'G'};
const ICOC = {web: '#004176', li_company: '#0A66C2', li_frank: '#0A66C2', fb: '#1877F2', ig: '#C13584', gbp: '#34A853'};

function render(d) {
  $('#tabs').innerHTML = SECTIONS.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('');
  const g = d.growth, inv = d.invites, L = d.leads, R = d.revenue;
  const today = new Date(), end = new Date(g.target_date + 'T23:59:59+08:00'), start = g.baseline_week_start ? new Date(g.baseline_week_start + 'T00:00:00+08:00') : null;
  const daysLeft = Math.max(0, Math.ceil((end - today) / 864e5));
  const lastWeek = [...g.weekly].reverse().find(w => num(w['Total followers']) !== null);
  const totalNow = lastWeek ? lastWeek['Total followers'] : null;
  const live = d.channels.filter(c => c.status === 'live').length;
  const todayIso = new Date(today.getTime() + 8 * 36e5).toISOString().slice(0, 10);
  const postsToday = d.posts.filter(p => p.date === todayIso).length;
  const todo = [];
  if (start && today < start) todo.push(`Baseline week starts ${dfmt(g.baseline_week_start)}: enter week-0 follower counts in Growth_Dashboard.xlsx.`);
  if (inv.sent === 0) todo.push(`Send the first ${inv.daily_quota} LinkedIn invites from Target_List.xlsx (by hand).`); else todo.push(`Keep pace: ${inv.daily_quota} LinkedIn invites per working day.`);
  const contacted = L.total - (L.status['Not contacted'] || 0);
  if (contacted === 0) todo.push('Lead outreach not started: Wave 1 Day 0 emails begin Mon 2 Nov.');
  d.channels.filter(c => c.status === 'pending').forEach(c => todo.push(`${c.name}: ${c.note.toLowerCase()}.`));
  if (!d.analytics.provider) todo.push('Connect website analytics.');

  const kpi = (l, v, s, cls = '') => `<div class="card kpi ${cls}"><div class="l">${l}</div><div class="v ${v.includes('na') || v === '—' ? 'na' : ''}">${v}</div><div class="s">${s}</div></div>`;
  let h = '';
  h += `<section id="today"><div class="grid"><div class="card hero"><p class="eyebrow">${today.toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'})}</p>
  <h1>Good ${today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, <em>Frank</em></h1>
  <p>${live} channels live · ${d.posts.length} posts published · ${fmt(L.total)} leads in pipeline · ${daysLeft} days to the 90-day target.</p>
  <ul class="todo">${todo.slice(0, 5).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
  ${kpi('Total followers', na(totalNow), `Target ${fmt(g.base_total_target)} by ${dfmt(g.target_date)}`)}
  ${kpi('Posts today', String(postsToday), `${d.posts.length} in the log`)}
  ${kpi('Invites sent', fmt(inv.sent), `${fmt(inv.accepted)} accepted`)}
  ${kpi('Revenue paid', usd(R.paid), `${usd(R.outstanding)} outstanding`)}</div></section>`;

  h += `<section id="channels"><div class="sh"><h2>Channels</h2><small>Counts entered from each platform; — = not yet measured</small></div><div class="list cols">` +
    d.channels.map(c => `<${c.url ? `a href="${esc(c.url)}" target="_blank" rel="noopener"` : 'div'} class="row"><span class="ico" style="background:${ICOC[c.id] || '#004176'}">${ICO[c.id] || '•'}</span>
    <span class="t"><b>${esc(c.name)}</b><span>${c.status === 'live' ? '<span class="pill">Live</span>' : '<span class="pill p">Pending</span>'} ${esc(c.note)}</span></span>
    <span class="n">${c.status === 'pending' ? '<span class="na">pending</span>' : na(c.value)}<small>${esc(c.metric_label)}</small></span></${c.url ? 'a' : 'div'}>`).join('') + `</div></section>`;

  h += `<section id="posts"><div class="sh"><h2>Published posts</h2><small>${d.posting_log_found ? 'Includes social/posting_log.md' : 'posting_log.md not created yet'}</small></div><div class="list">` +
    (d.posts.length ? d.posts.map(p => `<a class="row" href="${esc(p.url)}" target="_blank" rel="noopener"><span class="ico" style="background:${p.channel === 'Facebook' ? '#1877F2' : p.channel === 'LinkedIn' ? '#0A66C2' : '#004176'}">${p.channel === 'Facebook' ? 'f' : p.channel === 'LinkedIn' ? 'in' : '•'}</span>
    <span class="t"><b>${esc(p.title)}</b><span>${esc(p.channel)} · ${dfmt(p.date)}</span></span><span class="n" style="font-size:18px">↗</span></a>`).join('') : '<div class="card empty"><b>No posts yet</b></div>') + `</div></section>`;

  const lastRow = lastWeek || {};
  const colMap = {'LinkedIn - Frank personal followers': 'LI personal followers', 'LinkedIn - Opticircle company page': 'LI page followers', 'LinkedIn newsletter subscribers*': 'Newsletter subs', 'Facebook Page': 'FB followers', 'Instagram': 'IG followers', 'MN/ZH channels (FB group, WeChat)': 'MN/ZH followers'};
  const base0 = g.weekly[0] || {};
  h += `<section id="growth"><div class="sh"><h2>Growth vs 90-day plan</h2><small>Base case: +${fmt(g.base_total_target)} net followers by ${dfmt(g.target_date)} (estimate)</small></div>
  <div class="grid g2"><div class="card span2"><div class="tw"><table><thead><tr><th>Channel</th><th class="num hm">Week 0</th><th class="num">Now</th><th class="num">Gain</th><th class="num hm">Low</th><th class="num">Base</th><th class="num">Stretch</th></tr></thead><tbody>` +
    g.targets.map(t => { const k = colMap[t.channel], s = num(base0[k]), n = num(lastRow[k]), gain = s !== null && n !== null ? n - s : null, pct = gain !== null && t.base ? Math.min(100, gain / t.base * 100) : 0;
      return `<tr><td>${esc(t.channel.replace('*', '').replace(' - ', ' · '))}${t.in_total ? '' : ' <span class="pill g">overlap</span>'}<div class="bar"><i style="width:${pct}%"></i></div></td><td class="num hm">${na(s)}</td><td class="num">${na(n)}</td><td class="num">${na(gain)}</td><td class="num hm">${fmt(t.low)}</td><td class="num"><b>${fmt(t.base)}</b></td><td class="num">${fmt(t.stretch)}</td></tr>`; }).join('') +
    `<tr><td><b>Total (excl. newsletter)</b></td><td class="num hm">${na(base0['Total followers'])}</td><td class="num">${na(totalNow)}</td><td class="num">—</td><td class="num hm">${fmt(g.targets.filter(t => t.in_total).reduce((a, t) => a + t.low, 0))}</td><td class="num"><b>${fmt(g.base_total_target)}</b></td><td class="num">${fmt(g.targets.filter(t => t.in_total).reduce((a, t) => a + t.stretch, 0))}</td></tr></tbody></table></div>
    <p class="s" style="color:var(--muted);font-size:12.5px;margin:10px 0 0">${lastWeek ? 'Latest entry: week ' + lastWeek.Week : 'Not yet measured. Baseline (week 0) starts ' + dfmt(g.baseline_week_start) + '; enter actuals each Monday in Growth_Dashboard.xlsx.'}</p></div></div></section>`;

  const ar = inv.sent ? Math.round(inv.accepted / inv.sent * 100) + '%' : '—';
  h += `<section id="invites"><div class="sh"><h2>LinkedIn invites</h2><small>From Target_List.xlsx (${esc(inv.source_sheet || 'Send_Log')})</small></div><div class="grid">
  ${kpi('Sent', fmt(inv.sent), `Quota ${inv.daily_quota}/working day`)}${kpi('Accepted', fmt(inv.accepted), 'Acceptance ' + ar)}${kpi('Replies', fmt(inv.replies), `${fmt(inv.leads)} became leads`)}${kpi(inv.queued ? 'Queued' : 'Target list', fmt(inv.queued ?? inv.targets), `${fmt(inv.targets)} targets · ${fmt(inv.fit5)} at fit 5`)}
  <div class="card span2" style="grid-column:1/-1"><p class="eyebrow">Next up</p><div class="tw"><table><thead><tr><th>#</th><th>Organisation</th><th>Person</th><th>${inv.queued ? 'Planned' : 'Note'}</th></tr></thead><tbody>${inv.next_up.map(n => `<tr><td>${n.rank}</td><td>${esc(n.org)}</td><td>${n.url ? `<a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.role)}</a>` : esc(n.role)}</td><td>${esc(n.template)}</td></tr>`).join('')}</tbody></table></div></div></div></section>`;

  const st = Object.entries(L.status), fb = L.funnel_base || {};
  h += `<section id="leads"><div class="sh"><h2>Leads pipeline</h2><small>Deal values are assumptions, not quotes</small></div><div class="grid">
  ${kpi('Leads', fmt(L.total), `${L.warm} warm · ${L.cold} cold`)}${kpi('Contacted', fmt(contacted), st.map(([k, v]) => `${esc(k)}: ${v}`).join(' · '))}
  ${kpi('Pipeline (est.)', usd(L.pipeline_low_usd), 'Sum of low estimates')}${kpi('Expected 90-day cash', usd(fb.cash90 && fb.cash90.base), 'Base-case model, not a forecast')}
  <div class="card" style="grid-column:1/-1"><p class="eyebrow">Top-fit leads</p><div class="tw"><table><thead><tr><th>ID</th><th>Organisation</th><th class="hm">Segment</th><th class="num">Fit</th><th>Day 0</th><th>Status</th></tr></thead><tbody>${L.top.map(r => `<tr><td>${esc(r.id)}</td><td>${esc(r.org)}${r.warm === 'Warm' ? ' <span class="pill">warm</span>' : ''}</td><td class="hm">${esc(r.segment)}</td><td class="num">${r.fit}</td><td>${dfmt(r.day0)}</td><td><span class="pill g">${esc(r.status)}</span></td></tr>`).join('')}</tbody></table></div>
  <p style="color:var(--muted);font-size:12.5px;margin:10px 0 0">Sources: ${L.sources.map(s => `${esc(s.file.split('/').pop())} (${s.count})`).join(' · ')}</p></div>
  <div class="card" style="grid-column:1/-1"><p class="eyebrow">90-day funnel, base-case model</p><div class="funnel">${['mtg', 'props', 'wins90', 'usd90'].filter(k => fb[k]).map(k => `<div><span>${esc(fb[k].label)}</span><b>${k === 'usd90' ? usd(fb[k].base) : Number(fb[k].base).toFixed(1)}</b></div>`).join('')}</div></div></div></section>`;

  h += `<section id="revenue"><div class="sh"><h2>Revenue & invoices</h2><small>${esc(R.currency)} · from hq_build/manual.json</small></div><div class="grid">
  ${kpi('Invoiced', usd(R.invoiced), 'All time')}${kpi('Paid', usd(R.paid), 'Cash received')}${kpi('Outstanding', usd(R.outstanding), 'Sent + overdue')}${kpi('Invoices', String(R.invoices.length), 'Issued')}
  <div class="card" style="grid-column:1/-1"><div class="tw"><table><thead><tr><th>No.</th><th>Client</th><th>Issued</th><th>Due</th><th class="num">Amount</th><th>Status</th></tr></thead><tbody>${R.invoices.length ? R.invoices.map(i => `<tr><td>${esc(i.number)}</td><td>${esc(i.client)}</td><td>${dfmt(i.issued)}</td><td>${dfmt(i.due)}</td><td class="num">${usd(i.amount)}</td><td><span class="pill ${i.status === 'paid' ? '' : i.status === 'overdue' ? 'p' : 'g'}">${esc(i.status)}</span></td></tr>`).join('') : '<tr><td colspan="6" class="empty"><b>No invoices yet</b>The first one will appear here.</td></tr>'}</tbody></table></div></div></div></section>`;

  h += `<section id="traffic"><div class="sh"><h2>Website traffic</h2><small>${esc(d.channels[0].url)}</small></div>
  ${d.analytics.provider ? `<div class="card"><a href="${esc(d.analytics.dashboard_url)}" target="_blank" rel="noopener">Open ${esc(d.analytics.provider)} dashboard ↗</a></div>` :
    `<div class="card empty"><b>Connect analytics</b>Not yet measured. Free privacy-friendly analytics all need an account (e.g. GoatCounter, Cloudflare Web Analytics). Once one is set up, add it to manual.json → analytics.</div>`}</section>`;

  $('#main').innerHTML = h;
  $('#foot').innerHTML = `Data updated ${esc(new Date(d.generated_at).toLocaleString('en-GB', {timeZone: 'Asia/Ulaanbaatar', dateStyle: 'medium', timeStyle: 'short'}))} (UTC+8) · ${esc(d.company)} · Internal, not indexed. <a href="#" id="lock">Lock</a>`;
  $('#lock').onclick = e => { e.preventDefault(); localStorage.removeItem('hq_ok'); location.reload(); };
  const tabs = [...document.querySelectorAll('.tabs a')];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tabs.forEach(t => t.classList.toggle('on', t.hash === '#' + e.target.id)); }), {rootMargin: '-40% 0px -55% 0px'});
  document.querySelectorAll('section').forEach(s => io.observe(s));
}

$('#refresh').onclick = load;
let deferred; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
$('#installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true; };
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone;
if (ios && !localStorage.getItem('hq_ios')) { $('#iosHint').hidden = false; localStorage.setItem('hq_ios', 1); }
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#app').hidden) load(); });
gate();
