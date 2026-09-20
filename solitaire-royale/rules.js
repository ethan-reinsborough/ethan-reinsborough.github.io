/* Native rules for the eleven Solitaire Royale games. No emulator or network required. */
(function(root,factory){if(typeof module==='object')module.exports=factory();else root.Royale=factory();}(this,function(){
'use strict';
var games=['pyramid','golf','klondike','canfield','corners','calculation','shuffles','reno','concentration','pairs','wish'];
var titles=['pyramid','golf','klondike','canfield','corners','calculation','three shuffles and a draw','reno','concentration','pairs','the wish'];
function clone(v){return JSON.parse(JSON.stringify(v));}
function rng(seed){var x=seed>>>0;return function(){x+=0x6D2B79F5;var t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),c=a[i];a[i]=a[j];a[j]=c;}return a;}
function deck(){var a=[];for(var s=0;s<4;s++)for(var r=1;r<=13;r++)a.push({id:s*13+r,s:s,r:r,up:false});return a;}
function red(c){return c.s===0||c.s===2;}
function top(a){return a[a.length-1];}
function next(r,n){return (r+n-1)%13+1;}
function create(game,seed){
 if(games.indexOf(game)<0)throw Error('Unknown game');
 seed=seed===undefined?Math.floor(Math.random()*4294967296):seed>>>0;
 var s={version:1,game:game,seed:seed,stock:[],waste:[],reserve:[],tableau:[],foundations:[[],[],[],[]],removed:[],moves:0,won:false,base:1,shuffles:0,drawUsed:false,exceptionUsed:false,flipped:[],player:0,players:1,points:[0,0]},a=shuffle(deck(),rng(seed)),i,j,n;
 function take(){var c=a.pop();c.up=true;return c;}
 function cols(n,count,up){for(i=0;i<n;i++){var p=[];for(j=0;j<(typeof count==='function'?count(i):count);j++){var c=take();c.up=up||j===(typeof count==='function'?count(i):count)-1;p.push(c);}s.tableau.push(p);}}
 if(game==='klondike')cols(7,function(i){return i+1;},false);
 if(game==='canfield'||game==='reno'){for(i=0;i<13;i++){var c=take();c.up=i===12;s.reserve.push(c);}cols(4,1,true);}
 if(game==='golf'){cols(7,5,true);s.foundations[0].push(take());}
 if(game==='pyramid')cols(28,1,true);
 if(game==='corners'){cols(5,1,true);var b=take();s.base=b.r;s.foundations[0].push(b);}
 if(game==='calculation'||game==='shuffles'){
   for(i=0;i<4;i++){var at=a.findIndex(function(c){return game==='shuffles'?c.s===i&&c.r===1:c.r===i+1;});var c=a.splice(at,1)[0];c.up=true;s.foundations[i].push(c);}
   cols(game==='shuffles'?16:4,game==='shuffles'?3:0,true);
 }
 if(game==='concentration'||game==='pairs'||game==='wish'){
   a=deck().filter(function(c){return game==='concentration'?c.r<=6:(c.r===1||c.r>=7);});shuffle(a,rng(seed));
   if(game==='concentration'){cols(24,1,false);s.tableau.forEach(function(p){p[0].up=false;});}
   if(game==='wish')cols(8,4,false);
   if(game==='pairs'){cols(16,1,true);s.reserve=a.splice(0);}
 }
 s.stock=a;
 if(['pyramid','corners','reno'].indexOf(game)>=0&&s.stock.length)top(s.stock).up=true;
 return s;
}
function pile(s,p){if(!p)return null;if(p.type==='tableau'||p.type==='foundations')return s[p.type][p.pile];return s[p.type]||null;}
function card(s,p){var a=pile(s,p);return a&&a[p.index===undefined?a.length-1:p.index];}
function exposed(s,p,ignore){
 var a=pile(s,p),c=card(s,p);if(!c)return false;
 var i=p.index===undefined?a.length-1:p.index;
 if(s.game==='pyramid'&&p.type==='tableau'){
   var row=Math.floor((Math.sqrt(8*p.pile+1)-1)/2),pos=p.pile-row*(row+1)/2;
   if(row===6)return true;
   var below=(row+1)*(row+2)/2+pos;
   return [below,below+1].every(function(k){return !s.tableau[k].length||(ignore&&ignore.type==='tableau'&&ignore.pile===k);});
 }
 return i===a.length-1&&c.up;
}
function canMove(s,src,dst,draw){
 if(!src||!dst||src.type===dst.type&&src.pile===dst.pile)return false;
 if(['pyramid','pairs','wish','concentration'].indexOf(s.game)>=0)return false;
 var from=pile(s,src),to=pile(s,dst),c=card(s,src);if(!from||!to||!c||!c.up)return false;
 if(src.type==='foundations'||['tableau','stock','waste','reserve'].indexOf(src.type)<0)return false;
 var ix=src.index===undefined?from.length-1:src.index, moving=from.slice(ix),last=top(to),g=s.game;
 if(src.type!=='tableau'&&ix!==from.length-1)return false;
 if(draw){if(g!=='shuffles'||s.drawUsed||src.type!=='tableau')return false;moving=[c];}
 else if(['klondike','canfield','reno'].indexOf(g)>=0){
   for(var i=0;i<moving.length;i++)if(!moving[i].up||(i&&(moving[i-1].r!==moving[i].r+1||red(moving[i-1])===red(moving[i]))))return false;
   if(dst.type==='tableau'&&src.type==='tableau'&&ix!==from.findIndex(function(c){return c.up;}))return false;
 }else if(moving.length!==1)return false;
 if(dst.type==='foundations'){
   if(moving.length!==1)return false;
   if(g==='golf')return dst.pile===0&&last&&last.r!==13&&Math.abs(last.r-c.r)===1;
   if(to.length>=13)return false;
   if(g==='calculation')return c.r===next(last.r,dst.pile+1);
   if(!last)return c.r===s.base&&!s.foundations.some(function(p){return p.length&&p[0].s===c.s;});
   return c.s===last.s&&c.r===next(last.r,1);
 }
 if(dst.type!=='tableau'||g==='golf')return false;
 if(g==='calculation')return src.type==='waste';
 if(g==='shuffles')return !!last&&last.s===c.s&&last.r===c.r+1;
 if(g==='corners')return !last||c.r===next(last.r,12);
 if(!last){if((g==='canfield'||g==='reno')&&s.reserve.length)return src.type==='reserve';return c.r===13;}
 return last.up&&red(last)!==red(c)&&last.r===c.r+1;
}
function finish(s){s.moves++;s.won=s.game==='golf'?s.tableau.every(function(p){return !p.length;}):['pyramid','pairs','wish','concentration'].indexOf(s.game)>=0?s.tableau.every(function(p){return !p.length;})&&!s.stock.length&&!s.waste.length&&!s.reserve.length:s.foundations.reduce(function(n,p){return n+p.length;},0)===52;return true;}
function reveal(s){s.tableau.forEach(function(p){if(p.length&&s.game!=='concentration')top(p).up=true;});if(s.reserve.length&&s.game!=='pairs')top(s.reserve).up=true;if(s.stock.length&&['pyramid','corners','reno'].indexOf(s.game)>=0)top(s.stock).up=true;}
function move(s,src,dst,draw){if(!canMove(s,src,dst,draw))return false;var from=pile(s,src),i=src.index===undefined?from.length-1:src.index;var cards=from.splice(i,draw?1:from.length-i);Array.prototype.push.apply(pile(s,dst),cards);if(draw)s.drawUsed=true;reveal(s);return finish(s);}
function draw(s){
 var g=s.game,c,n;
 if(g==='pairs'){if(!s.reserve.length||top(s.reserve).up)return false;top(s.reserve).up=true;return finish(s);}
 if(['concentration','wish','shuffles'].indexOf(g)>=0)return false;
 if(!s.stock.length){if((g!=='klondike'&&g!=='canfield')||!s.waste.length)return false;s.stock=s.waste.reverse();s.waste=[];s.stock.forEach(function(c){c.up=false;});return finish(s);}
 if(g==='calculation'&&s.waste.length)return false;
 n=g==='klondike'||g==='canfield'?3:1;
 while(n--&&s.stock.length){c=s.stock.pop();c.up=true;(g==='golf'?s.foundations[0]:s.waste).push(c);}
 reveal(s);return finish(s);
}
function pair(s,a,b){
 var ca=card(s,a),cb=b&&card(s,b),g=s.game;if(!ca)return false;
 if(g==='pyramid'){
   if(!exposed(s,a))return false;
   if(ca.r!==13){if(!cb||ca.id===cb.id||ca.r+cb.r!==13||!exposed(s,b,a))return false;}
   else b=null;
 }else if(g==='pairs'||g==='wish'){
   if(!cb||ca.id===cb.id||ca.r!==cb.r||!exposed(s,a)||!exposed(s,b))return false;
   if(g==='pairs'&&s.reserve.length&&a.type!=='reserve'&&b.type!=='reserve'){
     if(s.exceptionUsed||!top(s.reserve).up||s.tableau.some(function(p){return p.length&&top(p).r===top(s.reserve).r;}))return false;
     s.exceptionUsed=true;
   }
 }else return false;
 [a,b].forEach(function(p){if(!p)return;var from=pile(s,p);s.removed.push(from.splice(p.index===undefined?from.length-1:p.index,1)[0]);});
 if(g==='pairs')s.tableau.forEach(function(p){if(!p.length&&s.reserve.length){var c=s.reserve.pop();c.up=true;p.push(c);}});
 reveal(s);return finish(s);
}
function flip(s,index){
 if(s.game!=='concentration'||s.flipped.length>=2||!s.tableau[index]||!s.tableau[index].length||top(s.tableau[index]).up)return false;
 top(s.tableau[index]).up=true;s.flipped.push(index);s.moves++;
 if(s.flipped.length===2&&top(s.tableau[s.flipped[0]]).r===top(s.tableau[s.flipped[1]]).r){s.flipped.forEach(function(i){s.removed.push(s.tableau[i].pop());});s.points[s.player]+=2;s.flipped=[];s.won=s.removed.length===24;}
 return true;
}
function conceal(s){if(s.flipped.length!==2)return false;s.flipped.forEach(function(i){top(s.tableau[i]).up=false;});s.flipped=[];if(s.players===2)s.player=1-s.player;return true;}
function reshuffle(s){
 if(s.game!=='shuffles'||s.shuffles>=2)return false;
 var a=[];s.tableau.forEach(function(p){Array.prototype.push.apply(a,p);});shuffle(a,rng(s.seed+s.shuffles+1));s.tableau=[];
 while(a.length)s.tableau.push(a.splice(0,3));s.shuffles++;return finish(s);
}
function score(s){return ['pyramid','pairs','wish','concentration'].indexOf(s.game)>=0?s.removed.length:s.won&&s.game==='golf'?52:s.foundations.reduce(function(n,p){return n+p.length;},0);}
function sources(s){var out=[];['tableau','waste','reserve','stock'].forEach(function(type){var lists=type==='tableau'?s.tableau:[s[type]];lists.forEach(function(p,pi){p.forEach(function(c,i){if(c.up)out.push({type:type,pile:pi,index:i});});});});return out;}
function hint(s){
 if(s.game==='concentration')return null;
 var srcs=sources(s),i,j,src,dst;
 if(['pyramid','pairs','wish'].indexOf(s.game)>=0){for(i=0;i<srcs.length;i++){src=srcs[i];if(s.game==='pyramid'&&card(s,src).r===13&&exposed(s,src))return {a:src};for(j=i+1;j<srcs.length;j++){if(pair(clone(s),src,srcs[j]))return{a:src,b:srcs[j]};if(pair(clone(s),srcs[j],src))return{a:srcs[j],b:src};}}return null;}
 for(i=0;i<srcs.length;i++){src=srcs[i];for(j=0;j<4;j++){dst={type:'foundations',pile:j};if(canMove(s,src,dst))return {a:src,b:dst};}}
 for(i=0;i<srcs.length;i++)for(j=0;j<s.tableau.length;j++){src=srcs[i];dst={type:'tableau',pile:j};if(src.type==='tableau'&&src.index===0&&!s.tableau[j].length)continue;if(canMove(s,src,dst))return {a:src,b:dst};}
 return null;
}
function valid(s){
 try{if(!s||s.version!==1||games.indexOf(s.game)<0||!Array.isArray(s.tableau)||s.tableau.length>28||!Array.isArray(s.foundations)||s.foundations.length!==4)return false;
 var all=[],seen={};['stock','waste','reserve','removed'].forEach(function(k){if(!Array.isArray(s[k]))throw Error();all=all.concat(s[k]);});s.tableau.concat(s.foundations).forEach(function(p){if(!Array.isArray(p))throw Error();all=all.concat(p);});
 var counts={pyramid:28,golf:7,klondike:7,canfield:4,corners:5,calculation:4,reno:4,concentration:24,pairs:16,wish:8};
 if(s.game==='shuffles'?s.tableau.length>16:s.tableau.length!==counts[s.game])return false;
 if(!Array.isArray(s.flipped)||s.flipped.length>2||s.flipped.some(function(i){return !Number.isInteger(i)||i<0||i>=s.tableau.length||!s.tableau[i].length;})||!Array.isArray(s.points)||s.points.length!==2||!s.points.every(Number.isFinite)||![1,2].includes(s.players)||![0,1].includes(s.player)||!Number.isInteger(s.base)||s.base<1||s.base>13||!Number.isInteger(s.shuffles)||s.shuffles<0||s.shuffles>2||!Number.isFinite(s.seed)||typeof s.won!=='boolean'||typeof s.drawUsed!=='boolean'||typeof s.exceptionUsed!=='boolean')return false;
 var total=s.game==='concentration'?24:s.game==='pairs'||s.game==='wish'?32:52;
 return all.length===total&&all.every(function(c){if(!c||!Number.isInteger(c.s)||!Number.isInteger(c.r)||c.s<0||c.s>3||c.r<1||c.r>13||c.id!==c.s*13+c.r||seen[c.id]||typeof c.up!=='boolean')return false;seen[c.id]=1;return true;})&&Number.isFinite(s.moves)&&s.moves>=0&&Array.isArray(s.flipped)&&s.flipped.length<=2;
 }catch(e){return false;}
}
return{games:games,titles:titles,clone:clone,rng:rng,create:create,pile:pile,card:card,red:red,exposed:exposed,canMove:canMove,move:move,draw:draw,pair:pair,flip:flip,conceal:conceal,reshuffle:reshuffle,score:score,sources:sources,hint:hint,valid:valid};
}));
