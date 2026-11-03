// Menu toggle, header shadow and gentle reveal-on-scroll. No tracking, no cookies.
document.documentElement.classList.remove('no-js');
document.addEventListener('DOMContentLoaded',function(){
 var b=document.querySelector('.menu-btn'),u=document.getElementById('menu'),t=document.querySelector('.top');
 if(b&&u){b.addEventListener('click',function(){var o=u.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});}
 var onS=function(){if(t)t.classList.toggle('scrolled',window.scrollY>8);};onS();window.addEventListener('scroll',onS,{passive:true});
 var els=document.querySelectorAll('.reveal');
 if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
 els.forEach(function(e){io.observe(e);});
});
// Contact form: composes an email in the visitor's own mail app. No server, no storage.
document.addEventListener('submit',function(e){var f=e.target;if(!f.matches('.cform'))return;e.preventDefault();
 var g=function(n){var el=f.elements[n];return el?el.value.trim():'';};
 var body='Name: '+g('name')+'\nCompany: '+g('company')+'\nEmail: '+g('email')+'\n\n'+g('message')+'\n';
 location.href='mailto:'+f.getAttribute('data-mailto')+'?subject='+encodeURIComponent((g('topic')||'Enquiry')+' | '+(g('company')||g('name')))+'&body='+encodeURIComponent(body);});

// Count-up, chart motion, savings estimate and country chart. Final numbers are in the HTML.
document.addEventListener('DOMContentLoaded',function(){
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setCount(el,v){
  var dec=parseInt(el.getAttribute('data-decimals')||'0',10);
  el.textContent=dec?Number(v).toFixed(dec):String(Math.round(v));
 }
 function animateCount(el){
  var target=parseFloat(el.getAttribute('data-count'));
  if(isNaN(target))return;
  if(reduce){setCount(el,target);return;}
  var t0=performance.now();
  function tick(now){
   var p=Math.min(1,(now-t0)/1100);
   var e=1-Math.pow(1-p,3);
   setCount(el,target*e);
   if(p<1)requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
 }
 var counts=document.querySelectorAll('[data-count]');
 if(!('IntersectionObserver' in window)||reduce){counts.forEach(function(el){setCount(el,parseFloat(el.getAttribute('data-count')));});}
 else{
  var cio=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;cio.unobserve(en.target);animateCount(en.target);});},{threshold:.4});
  counts.forEach(function(el){el.textContent=el.getAttribute('data-decimals')?'0.00':'0';cio.observe(el);});
 }
 document.querySelectorAll('.meter span,.stack i').forEach(function(el){
  var w=el.style.getPropertyValue('--w')||el.getAttribute('data-w');
  if(!w)return;
  if(reduce){el.style.width=w;return;}
  el.style.width='0%';
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.style.transition='width 1s cubic-bezier(.2,.7,.2,1)';el.style.width=w;});});
 });

 var form=document.getElementById('save-calc');
 if(form){
  var out=document.getElementById('save-out');
  var money=function(n){var cur=(form.elements.currency.value||'USD').trim()||'USD';var sign=n<0?'-':'';return sign+cur+' '+Math.abs(n).toLocaleString(undefined,{maximumFractionDigits:0});};
  var run=function(){
   var tonnes=parseFloat(form.elements.tonnes.value);
   var disp=parseFloat(form.elements.disposal.value);
   var rec=parseFloat(form.elements.recycle.value);
   var div=parseFloat(form.elements.diversion.value);
   var cap=form.elements.capex.value.trim();
   var capex=cap===''?null:parseFloat(cap);
   if(!(tonnes>=0)||isNaN(disp)||isNaN(rec)||!(div>=0&&div<=100)){out.innerHTML='<p>Enter tonnage, both costs, and a diversion between 0 and 100.</p>';return;}
   var diverted=tonnes*div/100;
   var savings=diverted*(disp-rec);
   var html='<p class="disclaimer">Indicative estimate, not a guarantee.</p>';
   html+='<p><strong>Estimated annual savings:</strong> '+money(savings)+'</p>';
   html+='<p><strong>Diversion achieved:</strong> '+diverted.toLocaleString(undefined,{maximumFractionDigits:1})+' tonnes ('+div+'%). This assumes the tonnage you entered is currently all sent to disposal, and that the target is reached in full.</p>';
   if(capex===null){html+='<p><strong>Payback:</strong> add an upfront cost to estimate payback.</p>';}
   else if(!(capex>=0)){html+='<p><strong>Payback:</strong> upfront cost needs to be zero or greater.</p>';}
   else if(!(savings>0)){html+='<p><strong>Payback:</strong> no payback, because the estimate does not show an annual saving.</p>';}
   else{var years=capex/savings;html+='<p><strong>Payback:</strong> '+years.toLocaleString(undefined,{maximumFractionDigits:1})+' years ('+money(capex)+' ÷ annual saving).</p>';}
   out.innerHTML=html;
  };
  form.addEventListener('submit',function(e){e.preventDefault();run();});
  form.addEventListener('input',run);
 }

 var board=document.getElementById('country-board');
 if(board){
  var metric=board.querySelector('.tabs');
  var chips=board.querySelector('.chips');
  var chart=document.getElementById('country-chart');
  var cards=board.querySelectorAll('.country');
  var current='recycling';
  var region='all';
  function draw(){
   var rows=[];
   cards.forEach(function(card){
    var reg=card.getAttribute('data-region');
    var show=region==='all'||reg===region;
    card.hidden=!show;
    if(!show)return;
    var raw=card.getAttribute('data-'+current);
    if(raw===null||raw==='')return;
    rows.push({name:card.getAttribute('data-name'),value:parseFloat(raw),unit:card.getAttribute('data-'+current+'-unit')||'%'});
   });
   rows.sort(function(a,b){return b.value-a.value;});
   var max=rows.reduce(function(m,r){return Math.max(m,r.value);},0)||1;
   var unit=rows.length?rows[0].unit:'';
   if(!rows.length){chart.innerHTML='<p class="na">No comparable figure for this view. Cards below show n/a where a source was not confirmed.</p>';return;}
   chart.innerHTML=rows.map(function(r){
    var w=(r.value/max*100).toFixed(1)+'%';
    return '<div class="bar-row"><span>'+r.name+'</span><span class="meter"><span style="--w:'+w+'"></span></span><b>'+r.value.toLocaleString(undefined,{maximumFractionDigits:3})+(unit==='%'?'%':' '+unit)+'</b></div>';
   }).join('');
   chart.querySelectorAll('.meter span').forEach(function(el){
    var w=el.style.getPropertyValue('--w');
    if(reduce){el.style.width=w;return;}
    el.style.width='0%';
    requestAnimationFrame(function(){el.style.transition='width .8s cubic-bezier(.2,.7,.2,1)';el.style.width=w;});
   });
  }
  metric.addEventListener('click',function(e){
   var b=e.target.closest('button');if(!b)return;
   metric.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false');});
   current=b.getAttribute('data-metric');draw();
  });
  chips.addEventListener('click',function(e){
   var b=e.target.closest('button');if(!b)return;
   chips.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
   region=b.getAttribute('data-region');draw();
  });
  draw();
 }
});

// If no mail app opens, show the address so the visitor can still reach Frank.
document.addEventListener('submit',function(e){var f=e.target;if(!f.matches('.cform,.gsform'))return;
 setTimeout(function(){if(f.querySelector('.mailfallback'))return;var p=document.createElement('p');p.className='note full mailfallback';p.setAttribute('role','status');
 p.innerHTML='Did your email app not open? Write to <a href="mailto:frankschepers@opticircle.com">frankschepers@opticircle.com</a> or call <a href="tel:+85298859925">+852 9885 9925</a>.';f.appendChild(p);},1500);},true);
