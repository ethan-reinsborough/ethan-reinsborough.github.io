/* Original EGA sprites decoded from SRCEGA.CDS; see assets/original-art.json. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(null);
 else root.RoyaleCards=factory(root);
}(this,function(root){
 'use strict';
 var backs=['motor car','bridge','river','pelican','forest','flowers','unicorn','lattice','bouquet','palms'];
 var faces=['classic','portraits','modern','costumes','crowns'];
 function choice(value,length){return Number.isInteger(value)&&value>=0&&value<length?value:0;}
 function indexFor(card,back,face){
  if(!card||!card.up)return choice(back,10);
  face=choice(face,5);
  if(card.r>=11)return 10+face*13+card.s*3+card.r-11;
  if(card.s===3)return card.r===1?22+face*13:104+card.r;
  return 75+card.s*10+card.r;
 }
 var cache={},atlas,ready=false;
 var loading='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="72" height="92"%3E%3Crect width="72" height="92" fill="black"/%3E%3Crect x="1" y="1" width="70" height="90" fill="white"/%3E%3C/svg%3E';
 function sprite(index){
  if(!ready)return loading;
  if(cache[index])return cache[index];
  var canvas=root.document.createElement('canvas');canvas.width=72;canvas.height=92;
  var ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(atlas,(index%10)*72,Math.floor(index/10)*46,72,46,0,0,72,92);
  return cache[index]=canvas.toDataURL('image/png');
 }
 if(root){atlas=new root.Image();atlas.onload=function(){ready=true;root.dispatchEvent(new Event('royale-cards-ready'));};atlas.src='./assets/original-ega.png';}
 return {backs:backs,faces:faces,indexFor:indexFor,make:function(card,back,face){return sprite(indexFor(card,back,face));},empty:function(){return sprite(75);}};
}));
