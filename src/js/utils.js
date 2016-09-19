'use strict';
class Utils {
  static $ (sel) {
    return document.querySelector(sel);
  }
  static $$ (sel) {
    return [].slice.call(document.querySelectorAll(sel));
  }
  static getBodyDimensions() {
    let body = document.body,
      html = document.documentElement;
    return {
      height: Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ),
      width: Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth )
    }
  }
  static getPageScroll() {
    let doc = document.documentElement;
    return {
      scrollX: (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0),
      scrollY: (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)
    }
  }
  static testIsCTA(target) {
    return target == Utils.getCTA();
  }
  static getCTA() {
    return Utils.$('a[href*="/contact"]');
  }
  static getCTAPostition() {
    let ele = Utils.getCTA();
    let pos = ele.getBoundingClientRect();
    return {
      x: (pos.left + (ele.offsetWidth/2)),
      y: (pos.top + (ele.offsetHeight/2))
    }
  }
  static getKeys(obj) {
    let keys = [];
    for (let key in obj) {
      keys.push(key);
    }
    return keys;
  }
  static getUrlVars( key, _href ) {
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
  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      let error = new Error(response.statusText)
      error.response = response
      throw error
    }
  }
  static parseJSON(response) {
    return response.json()
  }
  static getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase();
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

}
module.exports = Utils;
