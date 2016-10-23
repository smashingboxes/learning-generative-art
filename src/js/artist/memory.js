const _ = require('lodash');
const utils = require('../lib/utils');
const GLOBALS = require('../globals');

class ArtistMemory {
  static postToMemory(value_net_json, context) {
    if (value_net_json && window.localStorage) {
      localStorage.setItem('brain', value_net_json);

      if (context.learningUniforms) {
        localStorage.setItem('uniforms', JSON.stringify(context.learningUniforms));
      }

      let resolve = context.loadBrainFromJSON(JSON.parse(value_net_json))
        .then(context.doPaintCallback.bind(context))
        .catch(context.doPaintCallback.bind(context));

      ArtistMemory.postToDataServer(value_net_json);
      return resolve;
    }
    return ArtistMemory.postToDataServer(value_net_json)
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(context.loadBrainFromJSON)
      .then(context.doPaintCallback.bind(context))
      .catch(context.doPaintCallback.bind(context));
  }
  static postToDataServer(value_net_json) {
    return fetch(GLOBALS.ROOT+'/memory', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: value_net_json
    });
  }
  static fetchBrainJSON(callback, context) {
    if (window.localStorage && localStorage.getItem('brain')) {
      let value_net_json = localStorage.getItem('brain');
      let resolve = context.loadBrainFromJSON(JSON.parse(value_net_json))
        .then(callback)
        .catch(callback);
      return resolve;
    }
    return fetch(GLOBALS.ROOT+'/brain/brain.json')
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(context.loadBrainFromJSON)
      .then(callback)
      .catch(callback);
  }
}

module.exports = ArtistMemory;
