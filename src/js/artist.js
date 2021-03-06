const _ = require('lodash');
const utils = require('./lib/utils');
const $ = utils.$;
const $$ = utils.$$;
const GLOBALS = require('./globals');
const RNDUNIFORM = 1;

let TweenMax = require('gsap');

let Rewards = require('./rewards');
let pageUI = require('./pageUI');
let Memory = require('artist/memory');
let messageArtistBrain = require('artist/messageArtistBrain');

let DEGREE = 0.001;
let uniforms = null;
let myArtist;
let Actions;


// let ValidationWorker = require('worker!./artist/validation-worker');
// let validationWorker = new ValidationWorker();

let learnToPaintCycles = GLOBALS.AUTO_PAINT_CYCLES;
let SaveCounter = GLOBALS.ML_STATE_SAVE_COUNTER;
let LoadCounter = GLOBALS.ML_STATE_SAVE_COUNTER;


class Artist {
  addEventListeners() {
    let context = this;
    window.addEventListener('click', function (e) {
      if (utils.matchesCTA(e.target)) {
        window.dispatchEvent(new CustomEvent('main-cta-click'));
      }
    }, false);

    window.addEventListener('learn', function() {
      console.log('learn!');
      context.learnToPaint();
    }, false);

    window.addEventListener('userAdjustment', function(e) {
      Artist.animateUniform(e.detail, e.detail.index);
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
    if (localStorage.uniforms) {
      _uniforms = JSON.parse(localStorage.uniforms);
      if (_uniforms[0].name) {
        return _uniforms;
      }
      _uniforms = [];
    }

    while ( limit-- ) {
      _uniforms.push({
        name: 'learning'+limit,
        index: limit,
        val: (Math.random()*RNDUNIFORM)
      });
    }
    localStorage.setItem('uniforms', JSON.stringify(_uniforms));
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
      }, GLOBALS.PAINT_TIME*2.1);
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
      if (DEGREE < 0.01) {
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
  loadBrainFromJSON(data) {
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
    }, GLOBALS.PAINT_TIME/4);
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
    setTimeout(() => {
      console.log('next paint.')
      requestAnimationFrame(context.learnToPaint.bind(context));
    }, GLOBALS.DEEP_LEARN_THROTTLE);
  }
  static animateUniform(learningUniform, index) {
    TweenMax.to(learningUniform, GLOBALS.PAINT_TIME, {overwrite: 'all', val: uniforms.find((v) => v.name === learningUniform.name).val, ease: Linear.easeNone});
    //TweenMax.to(learningUniform, {val: uniforms.find((v) => v.name === learningUniform.name).val, ease: Linear.easeNone});
  }
  animateLearningUniforms() {
    let context = this;
    context.learningUniforms.forEach(Artist.animateUniform);
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
    LoadCounter = GLOBALS.ML_STATE_SAVE_COUNTER;
    Memory.fetchBrainJSON(function (data) {
      if (data && !data[1]) {
        console.log('Error', data);
      }
      context.doPainting();
    }, context);
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
                console.log('Error', e);
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
    SaveCounter = GLOBALS.ML_STATE_SAVE_COUNTER;
    return messageArtistBrain('getJSONFromBrain')
      .then(function (data) {
        return Memory.postToMemory(data[1], context);
      });
  }
  doPaintCallback (e) {
    //if (e) console.log(e);
    let context = this;
    requestAnimationFrame(context.learnToPaintLoop.bind(context));
    requestAnimationFrame(pageUI.artistLearnedFlash.bind(context));
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
    uniforms = context.learningUniforms.map(function (uniform, i) {
      return {name: uniform.name, val: uniform.val, index: i};
    });

    context.Actions = context.getActions();

    const num_inputs = context.getBrainInputs().length;
    const num_actions = context.Actions.length;
    const temporal_window = 20;
    const network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

    this.addEventListeners();

    messageArtistBrain('setup', [network_size, num_actions, num_inputs, temporal_window])
      .then(function() {
        Memory.fetchBrainJSON(function (data) {
          if (data && !data[1]) {
            console.log('Error', data);
          }
          context.getStarted();
        }, context);
      })
      .catch(function (e) {
        console.log(e);
      });
  }
}


myArtist = new Artist();
module.exports = myArtist;
