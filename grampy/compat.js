/* Small fallbacks for older, still-capable desktop browsers. */
if (!Number.isFinite) Number.isFinite = function (v) { return typeof v === 'number' && isFinite(v); };
if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
if (!Element.prototype.closest) Element.prototype.closest = function (selector) { var el=this; while(el && el.nodeType===1){if(el.matches(selector))return el;el=el.parentElement;}return null; };
