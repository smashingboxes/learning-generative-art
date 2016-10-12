let _ROOT = location.origin.match(/(localhost|generative-artist)/gi) ?  location.origin : 'http://generative-artist.smashingboxes.com';
const ROOT = _ROOT.replace('8080','3210');

module.exports = {
  ROOT: ROOT,
  AUTO_PAINT_CYCLES: 4,
  PAINT_TIME: 1000,
  DEEP_LEARN_THROTTLE: 10,
  ML_STATE_SAVE_COUNTER: 1000
}
