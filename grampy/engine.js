/* Dependency-free Klondike rules, shared by the browser and Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Solitaire = factory();
}(this, function () {
  'use strict';
  var suits = ['hearts', 'clubs', 'diamonds', 'spades'];
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function red(card) { return card.suit === 'hearts' || card.suit === 'diamonds'; }
  function create(random) {
    random = random || Math.random;
    var cards = [], i, s, j, tmp, state;
    for (s = 0; s < 4; s++) for (i = 1; i <= 13; i++) cards.push({id: suits[s] + '-' + i, suit: suits[s], rank: i, up: false});
    for (i = cards.length - 1; i > 0; i--) { j = Math.floor(random() * (i + 1)); tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp; }
    state = {stock: cards, waste: [], foundations: [[], [], [], []], tableau: [[], [], [], [], [], [], []], moves: 0, won: false};
    for (i = 0; i < 7; i++) for (j = 0; j <= i; j++) { tmp = cards.pop(); tmp.up = j === i; state.tableau[i].push(tmp); }
    return state;
  }
  function pile(state, src) { return src.type === 'waste' ? state.waste : src.type === 'tableau' ? state.tableau[src.pile] : src.type === 'foundation' ? state.foundations[src.pile] : null; }
  function sequence(cards) { for (var i = 0; i < cards.length; i++) if (!cards[i].up || (i && (cards[i - 1].rank !== cards[i].rank + 1 || red(cards[i - 1]) === red(cards[i])))) return false; return cards.length > 0; }
  function canMove(state, src, dst) {
    if (!src || !dst || (src.type === dst.type && src.pile === dst.pile)) return false;
    var from = pile(state, src), to = pile(state, dst);
    if (!from || !to || src.index < 0 || src.index >= from.length) return false;
    if (src.type !== 'tableau' && src.index !== from.length - 1) return false;
    var moving = from.slice(src.index), card = moving[0], last = to[to.length - 1];
    if (!sequence(moving)) return false;
    if (dst.type === 'foundation') return moving.length === 1 && card.suit === suits[dst.pile] && card.rank === to.length + 1;
    if (dst.type === 'tableau') return last ? last.up && red(card) !== red(last) && card.rank === last.rank - 1 : card.rank === 13;
    return false;
  }
  function move(state, src, dst) {
    if (!canMove(state, src, dst)) return false;
    var from = pile(state, src), to = pile(state, dst), moving = from.splice(src.index);
    Array.prototype.push.apply(to, moving);
    if (from.length && src.type === 'tableau') from[from.length - 1].up = true;
    state.moves++; state.won = count(state) === 52;
    return true;
  }
  function draw(state) {
    if (!state.stock.length && !state.waste.length) return false;
    if (state.stock.length) { var c = state.stock.pop(); c.up = true; state.waste.push(c); }
    else { state.stock = state.waste.reverse(); state.waste = []; state.stock.forEach(function (c) { c.up = false; }); }
    state.moves++; return true;
  }
  function sources(state) {
    var list = [];
    if (state.waste.length) list.push({type: 'waste', pile: 0, index: state.waste.length - 1});
    state.tableau.forEach(function (col, p) { col.forEach(function (c, i) { if(c.up) list.push({type: 'tableau', pile: p, index: i}); }); });
    return list;
  }
  function destinations(state, src) {
    var out = [], i, target;
    for (i = 0; i < 4; i++) { target = {type:'foundation',pile:i}; if(canMove(state,src,target)) out.push(target); }
    for (i = 0; i < 7; i++) { target = {type:'tableau',pile:i}; if(canMove(state,src,target)) out.push(target); }
    return out;
  }
  function hints(state) {
    var list = [];
    sources(state).forEach(function (src) {
      destinations(state, src).forEach(function (dst) {
        var p = pile(state, src), card = p[src.index], score = 0;
        // Ignore moving an entire king column to another empty column: no progress.
        if (src.type === 'tableau' && src.index === 0 && dst.type === 'tableau' && !state.tableau[dst.pile].length) return;
        if (src.type === 'tableau' && src.index > 0 && !p[src.index - 1].up) score += 20;
        if (dst.type === 'foundation') score += card.rank < 3 ? 30 : 12;
        if (src.type === 'waste') score += 5;
        list.push({src:src,dst:dst,score:score});
      });
    });
    return list.sort(function(a,b){return b.score-a.score;});
  }
  function count(state) { return state.foundations.reduce(function(n,p){return n+p.length;},0); }
  function canFinish(state) { return !state.stock.length && !state.waste.length && state.tableau.every(function(p){return p.every(function(c){return c.up;});}) && !state.won; }
  function valid(state) {
    if (!state || !Array.isArray(state.stock) || !Array.isArray(state.waste) || !Array.isArray(state.tableau) || state.tableau.length !== 7 || !Array.isArray(state.foundations) || state.foundations.length !== 4 || !Number.isFinite(state.moves) || state.moves < 0) return false;
    var all = [], seen = {}, okay = true;
    [state.stock,state.waste].concat(state.tableau,state.foundations).forEach(function(p){if(!Array.isArray(p)){okay=false;return;} all = all.concat(p);});
    if (!okay || all.length !== 52) return false;
    all.forEach(function(c){if(!c || suits.indexOf(c.suit)<0 || c.rank<1 || c.rank>13 || c.rank%1 || c.id!==c.suit+'-'+c.rank || seen[c.id] || typeof c.up!=='boolean') okay=false; else seen[c.id]=true;});
    if(!okay) return false;
    state.stock.forEach(function(c){if(c.up)okay=false;});state.waste.forEach(function(c){if(!c.up)okay=false;});
    state.foundations.forEach(function(p,s){p.forEach(function(c,i){if(c.suit!==suits[s] || c.rank!==i+1 || !c.up)okay=false;});});
    state.tableau.forEach(function(p){var first=-1;p.forEach(function(c,i){if(c.up && first<0)first=i;});if(p.length && (first<0 || !sequence(p.slice(first))))okay=false;});
    return okay && Boolean(state.won) === (count(state)===52);
  }
  return {suits:suits,clone:clone,red:red,create:create,pile:pile,canMove:canMove,move:move,draw:draw,sources:sources,destinations:destinations,hints:hints,count:count,canFinish:canFinish,valid:valid};
}));
