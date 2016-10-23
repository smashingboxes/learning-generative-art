import featureDetection from './featureDetection';

let version = '1.0.1'; // bump this number if you want to reset locally stored items
export default (function versioning() {
  if (!featureDetection.isSupportedDevice()) return 0;
  //console.log('localStorage.version', localStorage.version)
  if (localStorage.version) {
    if (localStorage.version !== version) {
      console.log('version bump. clear localStorage.', version);
      localStorage.clear();
      localStorage.setItem('version', version);
    }
  } else {
    localStorage.setItem('version', version);
  }
})();
