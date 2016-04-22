(function (window, document) {

const fetch = window.fetch || require('whatwg-fetch');
const Promise = Promise || require('es6-promise');

const ROOT = location.origin.replace('8080','3210');

console.log(fetch, Promise);

window.learningUniforms = generateUniforms();
var deepqlearn = require("deepqlearn");

const num_inputs = 1; // 9 eyes, each sees 3 numbers (wall, green, red thing proximity)
const num_actions = getActions().length; // 5 possible angles agent can turn
const temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
const network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;
const AUTO_PAINT_CYCLES = 10;

var justPaintCycles = AUTO_PAINT_CYCLES;

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

function getActions () {
  return window.learningUniforms.reduce(function (result, currentUniform, index) {
    result.push( (function () {
      //Decrement a little
      this.val -= 0.001;
      return this;
    }).bind(currentUniform) );

    result.push( (function () {
      //Increment a little
      this.val += 0.001;
      return this;
    }).bind(currentUniform) );

    result.push( (function () {
      //Decrement a lot
      this.val -= 0.1;
      return this;
    }).bind(currentUniform) );

    result.push( (function () {
      //Increment a lot
      this.val += 0.1;
      return this;
    }).bind(currentUniform) );

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

fetch(ROOT+'/brain/brain.json')
  .then(checkStatus)
  .then(parseJSON)
  .then(loadBrainFromJSON)
  .catch(function (err) {
    console.log(err);
  });

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
  if ( !(--justPaintCycles) ) return;
  var action = brain.forward(window.learningUniforms.map(function (uni) {
    return uni.val;
  }));
  getActions()[action]();

  if ( validateResult() < 30 ) {
    //Bad artist!
    window.rewards.merit = -1;
    learnToPaint();
  } else {
    requestAnimationFrame(justPaint);
  }
}

function getKeys(obj) {
  let keys = [];
  for (let key in obj) {
    keys.push(key);
  }
  return keys;
}

function validateResult() {
  var gl = window.gl;
  if (!gl) return;
  var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  var _limit = pixels.reduce(function (result, current, index, arr) {
    if ( index && index % 4 === 0 ) {
      let track = {name:'',}
      let name = 'r'+ '' +arr[index-1]+ 'g' +arr[index-2]+ 'b' +arr[index-3];
      if ( !result[name] ) result[name] = 0;
      result[name]++;
    }
    return result;
  }, {});
  return getKeys(_limit).length;
}

function learnToPaint () {
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
      justPaintCycles = AUTO_PAINT_CYCLES;
      justPaint();
    });

  console.log(window.rewards.merit);
}

justPaint();

})(window, document);
