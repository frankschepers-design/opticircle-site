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
