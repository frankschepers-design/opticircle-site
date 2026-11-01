// Free gap scan intake: composes an email in the visitor's own mail app. No server, no storage.
document.addEventListener('submit',function(e){
 var f=e.target; if(!f.matches('.gsform')) return;
 e.preventDefault(); e.stopImmediatePropagation();
 var lines=[], seen={};
 Array.prototype.forEach.call(f.elements,function(el){
  if(!el.name||seen[el.name]||el.tagName==='BUTTON') return;
  if(el.type==='checkbox'){
   seen[el.name]=1;
   var v=Array.prototype.map.call(f.querySelectorAll('input[name="'+el.name+'"]:checked'),function(x){return x.value;});
   lines.push(el.name+': '+(v.join('; ')||'-')); return;
  }
  lines.push(el.name+': '+(el.value.trim()||'-'));
 });
 var co=((f.elements['Company']||{}).value||'').trim();
 location.href='mailto:'+f.getAttribute('data-mailto')+'?subject='+encodeURIComponent('Free gap scan intake | '+co)+'&body='+encodeURIComponent('Hello Frank,\n\nHere is my intake for the free gap scan.\n\n'+lines.join('\n')+'\n');
},true);
