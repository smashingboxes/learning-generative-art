function checkFeatures() {
  let out = true;
  for (let i in featureDetection) {
    if (!featureDetection[i]) {
      out = false;
    }
  }
  return out;
}
let featureDetection = {
  isSupportedDevice: checkFeatures,
  features: {
    Worker: !!window.Worker,
    localStorage: !!window.localStorage,
    gl: true
  }
};
export default featureDetection;
