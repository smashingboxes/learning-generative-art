module.exports = {
  getUrlVars: function getUrlVars( key, _href ) {
    var href = _href || window.location.href;
    var map = {};
    var parts = href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      map[key] = value;
    });
    if (key) {
      return map[key];
    }
    return map;
  }
}
