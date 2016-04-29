;(function (window, document) {

const fetch = window.fetch || require('whatwg-fetch').fetch;
//const Promise = Promise || require('es6-promise');

var ValidationWorker = require("worker!./validation-worker");
var validationWorker = new ValidationWorker();

const ROOT = location.origin.replace('8080','3210');

console.log(fetch, Promise);

window.learningUniforms = generateUniforms();
let deepqlearn = require('deepqlearn');
let utils = require('utils');
let TweenMax = require('gsap');

const num_inputs = window.learningUniforms.length; // 9 eyes, each sees 3 numbers (wall, green, red thing proximity)
const num_actions = getActions().length; // 5 possible angles agent can turn
const temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
const network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;
const AUTO_PAINT_CYCLES = 4;

let learnToPaintCycles = AUTO_PAINT_CYCLES;

const PAINT_TIME = 500;


// the value function network computes a value of taking any of the possible actions
// given an input state. Here we specify one explicitly the hard way
// but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
// to just insert simple relu hidden layers.
var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'regression', num_neurons:num_actions});

// options for the Temporal Difference learner that trains the above net
// by backpropping the temporal difference learning rule.
var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 30000;
opt.start_learn_threshold = 10;
opt.gamma = 0.7;
opt.learning_steps_total = 200000;
opt.learning_steps_burnin = 30;
opt.epsilon_min = 0.05;
opt.epsilon_test_time = 0.05;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

var brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo


function generateUniforms () {
  let limit = 10;
  let _uniforms = [];
  while ( limit-- ) {
    _uniforms.push( { name: 'learning'+limit, index: limit, val: Math.random() } );
  }
  console.log(_uniforms);
  return _uniforms;
}

function actionFactory (degree) {
  return function () {
    TweenMax.to(this, PAINT_TIME/1000, {val: this.val + degree});
    return this;
  }
}

function getActions () {
  return window.learningUniforms.reduce(function (result, currentUniform, index) {
    result.push( (actionFactory(-0.0001)).bind(currentUniform) );
    result.push( (actionFactory(0.0001)).bind(currentUniform) );
    result.push( (actionFactory(-0.1)).bind(currentUniform) );
    result.push( (actionFactory(0.1)).bind(currentUniform) );
    return result;
  }, [function () {
    //no action
    //noop
  }]);
}

window.addEventListener('learn', function () {
  console.log('learn!');
  learnToPaint();
}, false);

window.addEventListener('panic', function () {
  console.log('panic!');
  window.learningUniforms = generateUniforms();
}, false);


function loadBrainFromJSON (data) {
  console.log(data);
  brain.value_net.fromJSON( data ) //LOAD BRAIN;
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

function justPaint() {
  var action = brain.forward(window.learningUniforms.map(function (uni) {
    return uni.val;
  }));
  getActions()[action]();
  setTimeout(function () {
    justPaint();
  }, PAINT_TIME/4);
}

function getKeys(obj) {
  let keys = [];
  for (let key in obj) {
    keys.push(key);
  }
  return keys;
}

function validateResult() {
  let gl = window.gl;
  if (!gl) return;

  return new Promise(function (resolve, reject) {

    validationWorker.onmessage = function(event) {
      //console.log(event);
      resolve(event.data[0]);
    };

    let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    validationWorker.postMessage([pixels]);
  });
}

function learnToPaintLoop () {
  validateResult()
    .then(function (resultValidity) {
      if ( resultValidity > 0.6 ) {
        //Bad artist!
        if (window.rewards.merit > 0) {
          window.rewards.merit = 0;
        } else {
          window.rewards.merit -= 1;
        }
        console.log('Bad Painting!', resultValidity, window.rewards.merit);
      } else if ( resultValidity < 0.12 ) {
        if (window.rewards.merit <= 0) {
          window.rewards.merit = 1;
        }
        console.log('Good Painting!', resultValidity, window.rewards.merit);
      }
      requestAnimationFrame(learnToPaint);
    })
    .catch((e) => {
      console.log(e);
    });
}
function learnToPaint () {
  if ( utils.getUrlVars('learningmodeoff') ) {
    return;
  }
  if ( !(--learnToPaintCycles) ) {
    requestAnimationFrame(justPaint);
    return;
  };

  var action = brain.forward(window.learningUniforms.map(function (uni) {
    return uni.val;
  }));

  // action is a number in [0, num_actions) telling index of the action the agent chooses
  getActions()[action]();

  // here, apply the action on environment and observe some reward. Finally, communicate it:
  var r = brain.backward( window.rewards.merit ); // <-- learning magic happens here

  fetch(ROOT+'/memory', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brain.value_net.toJSON())
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(loadBrainFromJSON)
    .then(function () {
      learnToPaintCycles = AUTO_PAINT_CYCLES;
      learnToPaintLoop();
    });
}


fetch(ROOT+'/brain/brain.json')
  .then(checkStatus)
  .then(parseJSON)
  .then(loadBrainFromJSON)
  .then(function () {
    if ( utils.getUrlVars('learningmodeoff') ) {
      justPaint();
    } else {
      learnToPaint();
    }
  })
  .catch(function (err) {
    console.log(err);
  });


})(window, document);
