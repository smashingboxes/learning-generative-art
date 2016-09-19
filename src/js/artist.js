const _ = require('lodash');
const utils = require('utils');
const $ = utils.$;
const $$ = utils.$$;
const GLOBALS = require('./globals');

let TweenMax = require('gsap');

let Rewards = require('./rewards');
let messageArtistBrain = require('./messageArtistBrain');
let DEGREE = 0.001;
let uniforms = null;

let myArtist;
let Actions;


const AUTO_PAINT_CYCLES = 4;
const PAINT_TIME = 1000;
const ML_STATE_SAVE_COUNTER = 500;


// let ValidationWorker = require('worker!./validation-worker');
// let validationWorker = new ValidationWorker();

let learnToPaintCycles = AUTO_PAINT_CYCLES;
let SaveCounter = ML_STATE_SAVE_COUNTER;
let LoadCounter = ML_STATE_SAVE_COUNTER;


class Artist {
  addEventListeners() {
    let context = this;
    window.addEventListener('click', function (e) {
      e.preventDefault();
      if ( e.target == utils.getCTA()) {
        window.dispatchEvent(new Event('main-cta-click'));
      }
    }, false);

    window.addEventListener('learn', function() {
      console.log('learn!');
      context.learnToPaint();
    }, false);

    window.addEventListener('panic', function() {
      console.log('panic!');
      context.panicFunction()
        .then(function() {
          context.learnToPaintLoop();
        });
    }, false);
  }
  generateUniforms() {
    //TODO: Better names for uniforms
    let limit = 10;
    let _uniforms = [];
    while ( limit-- ) {
      _uniforms.push({
        name: 'learning'+limit,
        index: limit,
        val: Math.random()
      });
    }
    console.log(_uniforms);
    return _uniforms;
  }
  panicFunction() {
    //crazy reset
    uniforms.forEach(function (currentUniform, index) {
      (function (degree) {
        TweenMax.set(this, {val: degree});
      }).bind(currentUniform)(currentUniform.value + ((Math.random()-0.5)/100));
    });

    console.log('Panic Reset!');

    return new Promise(function (resolve, reject) {
      setTimeout(function() {
        resolve();
      }, PAINT_TIME*2.1);
    });
  }
  actionFactory() {
    return function() {
      let resolver;
      let p = new Promise(function (resolve) {
        resolver = resolve;
      });

      TweenMax.set(this, {
        val: this.val + (DEGREE)
      });
      resolver();
      return p;
    }
  }
  getActions() {
    let context = this;
    return uniforms.reduce(function (result, currentUniform, index) {
      //Add action on the uniform to subtract by degree
      result.push( (context.actionFactory(-DEGREE)).bind(currentUniform) );
      //Add action on the uniform to add by degree
      result.push( (context.actionFactory(DEGREE)).bind(currentUniform) );
      return result;
    }, [
    function() {
      if (DEGREE < 0.1) {
        DEGREE * 10;
      }
      //console.log('change degree', DEGREE);
      return Promise.resolve(DEGREE);
    },
    function() {
      if (DEGREE > 0.0000001) {
        DEGREE / 10;
      }
      //console.log('change degree', DEGREE);
      return Promise.resolve(DEGREE);
    },
    function() {
      //no action
      return Promise.resolve('');
    }
    ]);
  }
  loadBrainFromJSON (data) {
    //console.log('Brain Loaded', data);
    if (data.layers) {
      return messageArtistBrain('loadBrainFromJSON', [data]);
    }
    return;
  }
  getBrainInputs() {
    let pageSize = utils.getBodyDimensions();
    let pageScroll = utils.getPageScroll();
    let cta = utils.getCTAPostition();
    let inputs = [
      Date.now()-Rewards.timePageLoad,
      pageScroll.scrollX / pageSize.width,
      pageScroll.scrollY / pageSize.height,
      mouse.x / pageSize.width,
      mouse.y / pageSize.height,
      (cta.x / pageSize.width) - (mouse.x / pageSize.width),
      (cta.y / pageSize.height) - (mouse.y / pageSize.height),
      DEGREE,
    ].concat(this.getLearningUniformsInputs());

    return inputs;
  }
  getLearningUniformsInputs() {
    return this.learningUniforms.map(function (uni) {
      return uni.val;
    })
  }
  justPaint() {
    var action = messageArtistBrain('forward', [this.getBrainInputs()]);

    Actions[action]();
    setTimeout(function() {
      justPaint();
    }, PAINT_TIME/4);
  }
  validateResult() {
    let gl = window.gl;
    if (!gl) return;

    return new Promise(function (resolve, reject) {
      validationWorker.onmessage = function(event) {
        //console.log(event);
        resolve(event.data[0]);
      };

      let pixels = new Uint8Array(Math.floor(gl.drawingBufferWidth * gl.drawingBufferHeight * 4));
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      validationWorker.postMessage([pixels]);
    });
  }
  learnToPaintLoop() {
    let context = this;
    requestAnimationFrame(context.learnToPaint.bind(context));
  }
  animateLearningUniforms() {
    this.learningUniforms.forEach(function(learningUniform, index) {
      TweenMax.to(learningUniform, 1, {val: uniforms[index].val});
    });
  }
  learnToPaint() {
    let context = this;
    context.animateLearningUniforms();
    if ( utils.getUrlVars('learningmodeoff') ) {
      return;
    }
    if (LoadCounter > 0) {
      LoadCounter--;
      context.doPainting();
      return;
    }
    LoadCounter = ML_STATE_SAVE_COUNTER;
    context.fetchBrainJSON(function (data) {
      if (data && !data[1]) {
        console.error('Error', data);
      }
      context.doPainting();
    });
  }
  doPainting() {
    let context = this;
    return messageArtistBrain('forward', [this.getBrainInputs()])
      .then(function (messageData) {
        let action = messageData[1];
        //console.log('action', action);
        // action is a number in [0, num_actions) telling index of the action the agent chooses
        return context.Actions[action](action)
          .then(function (out) {
            //console.log('Action: ', action, out);
            var reward = Rewards.calculateReward();
            context.nextPaintingStep();
            messageArtistBrain('backward', [reward])  // <-- learning magic happens here
              .catch(function (e) {
                console.error('Error', e);
              });
          });
      });
  }
  nextPaintingStep() {
    let context = this;
    if (SaveCounter > 0) {
      SaveCounter--;
      context.doPaintCallback();
      return Promise.resolve();
    }
    SaveCounter = ML_STATE_SAVE_COUNTER;
    return messageArtistBrain('getJSONFromBrain')
      .then(function (data) {
        return context.postToMemory(data[1]);
      });
  }
  postToMemory (value_net_json) {
    let context = this;
    return fetch(GLOBALS.ROOT+'/memory', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: value_net_json
      })
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(context.loadBrainFromJSON)
      .then(context.doPaintCallback.bind(context))
      .catch(context.doPaintCallback.bind(context));
  }
  fetchBrainJSON (callback) {
    let context = this;
    return fetch(GLOBALS.ROOT+'/brain/brain.json')
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(context.loadBrainFromJSON)
      .then(callback)
      .catch(callback);
  }
  doPaintCallback (e) {
    //if (e) console.log(e);
    let context = this;
    requestAnimationFrame(context.learnToPaintLoop.bind(context));
    requestAnimationFrame(context.artistLearnedFlash.bind(context));
  }
  artistLearnedFlash() {
    TweenMax.to('#learned', 0.3, {scale: '1'});
    TweenMax.to('#learned', 0.7, {scale: '0.01', delay: 0.2});
  }
  getStarted() {
    let context = this;
    if ( utils.getUrlVars('learningmodeoff') ) {
      return context.justPaint();
    }
    return context.learnToPaint();
  }

  constructor() {
    let context = this;

    context.learningUniforms = context.generateUniforms();
    uniforms = context.learningUniforms.map(function (uniform) {
      return {name: uniform.name, val: uniform.val};
    });

    context.Actions = context.getActions();

    const num_inputs = context.getBrainInputs().length;
    const num_actions = context.Actions.length;
    const temporal_window = 20;
    const network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

    this.addEventListeners();

    messageArtistBrain('setup', [network_size, num_actions, num_inputs, temporal_window])
      .then(function() {
        context.fetchBrainJSON(function (data) {
          if (data && !data[1]) {
            console.error('Error', data);
          }
          context.getStarted();
        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }
}


myArtist = new Artist();
module.exports = myArtist;
