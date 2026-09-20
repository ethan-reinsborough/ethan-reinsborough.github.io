/* Classic Solitaire-style win cascade: gravity, bouncing cards, permanent trails. */
(function (root) {
  'use strict';
  root.startWinCascade = function (table, onDone) {
    var canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
    if(!ctx){onDone();return function(){};}
    var bounds=table.getBoundingClientRect(), width=table.clientWidth, height=table.clientHeight;
    var piles=table.querySelectorAll('[data-type="foundation"]'), origins=[];
    if(piles.length!==4){onDone();return function(){};}
    for(var i=0;i<4;i++){var box=piles[i].getBoundingClientRect();origins.push({x:box.left-bounds.left-table.clientLeft,y:box.top-bounds.top-table.clientTop,w:box.width,h:box.height});}
    // A low-resolution drawing surface gives the trails their old Windows edges.
    canvas.width=width;canvas.height=height;canvas.className='win-cascade';canvas.setAttribute('aria-hidden','true');
    ctx.imageSmoothingEnabled=false;
    var button=document.createElement('button');button.className='cascade-dismiss';button.textContent='Continue';
    var previousFocus=document.activeElement, stopped=false, frame=0, elapsed=0, previous=0, accumulator=0, launched=0, active=[], deck=[];
    var raf=root.requestAnimationFrame||function(fn){return setTimeout(function(){fn(Date.now());},16);};
    var cancel=root.cancelAnimationFrame||clearTimeout;
    var suits=['♥','♣','♦','♠'], crops=['🍎','🥔','🥕','🌽'];
    var cardW=Math.round(origins[0].w),cardH=Math.round(origins[0].h);
    function sprite(suit,rank){
      var img=document.createElement('canvas');img.width=cardW;img.height=cardH;var c=img.getContext('2d');
      c.fillStyle='#fffef4';c.fillRect(1,1,cardW-2,cardH-2);c.strokeStyle='#17221d';c.strokeRect(.5,.5,cardW-1,cardH-1);
      var ink=suit===0||suit===2?'#b32124':'#17221d',text=rank===1?'A':rank===11?'J':rank===12?'Q':rank===13?'K':String(rank);
      var size=Math.max(12,Math.round(cardW*.24));
      function corner(){c.fillStyle=ink;c.textAlign='left';c.textBaseline='top';c.font='bold '+size+'px Georgia,serif';c.fillText(text,4,3);c.font=size+'px Georgia,serif';c.fillText(suits[suit],4,3+size*.92);}
      corner();c.save();c.translate(cardW,cardH);c.rotate(Math.PI);corner();c.restore();
      c.textAlign='center';c.textBaseline='middle';c.fillStyle=ink;
      c.font=Math.round(cardW*.43)+'px "Segoe UI Emoji","Apple Color Emoji",serif';
      c.fillText(rank===13?'🚜':rank===12?'🐄':rank===11?'🐦':rank===1?suits[suit]:crops[suit],cardW/2,cardH/2);
      return img;
    }
    for(var suit=0;suit<4;suit++){deck[suit]=[];for(var rank=1;rank<=13;rank++)deck[suit][rank]=sprite(suit,rank);}
    function paint(suit,rank){var p=origins[suit];ctx.clearRect(p.x-1,p.y-1,cardW+2,cardH+2);if(rank)ctx.drawImage(deck[suit][rank],Math.round(p.x),Math.round(p.y));}
    function stop(notify){
      if(stopped)return;stopped=true;cancel(frame);root.removeEventListener('resize',resized);document.removeEventListener('keydown',keydown,true);document.removeEventListener('visibilitychange',visibility);
      table.classList.remove('celebrating');canvas.removeEventListener('click',continueWin);button.removeEventListener('click',continueWin);
      if(canvas.parentNode)canvas.parentNode.removeChild(canvas);if(button.parentNode)button.parentNode.removeChild(button);
      if(previousFocus&&document.contains(previousFocus))previousFocus.focus();
      if(notify)onDone();
    }
    function continueWin(e){if(e){e.preventDefault();e.stopPropagation();}stop(true);}
    function keydown(e){if(e.key==='Escape'||e.key==='Enter'||e.key===' '){continueWin(e);}}
    function resized(){stop(true);}
    function visibility(){previous=0;accumulator=0;}
    function launch(){
      var s=launched%4,r=13-Math.floor(launched/4),p=origins[s],scale=width/800;
      paint(s,r-1);
      active.push({x:p.x,y:p.y,vx:(Math.random()<.8?-1:1)*(3.4+Math.random()*3.8)*scale,vy:-Math.random()*2.2,sprite:deck[s][r]});
      launched++;
    }
    function step(){
      elapsed+=1/60;
      if(launched<52&&elapsed>=launched*.30)launch();
      for(var j=active.length-1;j>=0;j--){
        var card=active[j];card.vy+=.34*(height/500);card.x+=card.vx;card.y+=card.vy;
        if(card.y+cardH>=height){card.y=height-cardH;card.vy=-Math.abs(card.vy)*.79;if(Math.abs(card.vy)<1)card.vy=0;}
        // Deliberately never clear previous positions: the famous card ribbons.
        ctx.drawImage(card.sprite,Math.round(card.x),Math.round(card.y));
        if(card.x+cardW<0||card.x>width)active.splice(j,1);
      }
    }
    function tick(now){
      if(stopped)return;
      if(!document.hidden){if(previous)accumulator+=Math.min((now-previous)/1000,.08);while(accumulator>=1/60){step();accumulator-=1/60;}previous=now;}
      else previous=0;
      if((launched===52&&!active.length)||elapsed>24){stop(true);return;}
      frame=raf(tick);
    }
    table.classList.add('celebrating');table.appendChild(canvas);table.appendChild(button);
    for(var s=0;s<4;s++)paint(s,13);
    canvas.addEventListener('click',continueWin);button.addEventListener('click',continueWin);root.addEventListener('resize',resized);document.addEventListener('keydown',keydown,true);document.addEventListener('visibilitychange',visibility);
    button.focus({preventScroll:true});frame=raf(tick);
    return function(){stop(false);};
  };
}(window));
