let _ROOT = (location.origin.match(/(localhost|generative-artist)/gi) ?  location.origin : 'http://generative-artist.smashingboxes.com';
const ROOT = (_ROOT.replace('8080','3210'));

module.exports = {
  ROOT:ROOT
}
