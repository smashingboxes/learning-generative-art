'use strict';

let deepqlearn = require('./deepqlearn');
let brain;
class ArtistBrain {
  static setup(messageType, network_size, num_actions, num_inputs, temporal_window) {
    let layer_defs = [];
    layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
    layer_defs.push({type:'fc', num_neurons: 25, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons: 25, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons: 25, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons: num_actions, activation:'relu'});
    layer_defs.push({type:'regression', num_neurons:num_actions});

    let tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};
    let opt = {};
    opt.temporal_window = temporal_window;
    opt.experience_size = 1000;
    opt.start_learn_threshold = 10;
    opt.gamma = 0.7;
    opt.learning_steps_total = 2000000;
    opt.learning_steps_burnin = 300;
    opt.epsilon_min = 0.05;
    opt.epsilon_test_time = 0.05;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    console.log('setup!', num_inputs, num_actions, opt);
    brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo
    return messageType;
  }
  static forward(messageType, inputs) {
    //console.clear();
    return brain.forward(inputs);
  }
  static backward(messageType, reward) {
    return brain.backward(reward); // <-- learning magic happens here
  }
  static loadBrainFromJSON(messageType, jsondata) {
    brain.value_net.fromJSON(jsondata);
    return true;
  }
  static getJSONFromBrain(messageType, jsondata) {
    let _brain_json = JSON.stringify(brain.value_net.toJSON());
    //console.log(_brain_json.length);
    return _brain_json;
  }
}

onmessage = function(e) {
  let messageType = e.data[0];
  if ( ArtistBrain[messageType] ) {
    //console.log('Message in worker', e.data, actions[messageType]);
    let response = ArtistBrain[messageType](messageType, e.data[1], e.data[2], e.data[3], e.data[4]);
    postMessage([messageType, response]);
  }
}
