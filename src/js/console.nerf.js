(function (window) {
  if (!window.console) {
    var noop = function (){};
    var keys = ['debug','error','info','log','warn','dir','dirxml','table','trace','group','groupCollapsed','groupEnd','clear','count','assert','markTimeline','profile','profileEnd','timeline','timelineEnd','time','timeEnd','timeStamp','memory'];
    window.console = {};
    for (var i = keys.length - 1; i >= 0; i--) {
      window.console[keys[i]] = noop;
    }
  }
})(window);
