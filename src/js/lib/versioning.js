import featureDetection from './featureDetection';

let version = '1.0.2'; // bump this number if you want to reset locally stored items
export default (function versioning() {
  if (!featureDetection.isSupportedDevice()) {
    console.log('Djarvis does not support this device.');
    return 0;
  }
  if (localStorage.version) {
    if (localStorage.version !== version) {
      console.log('version bump. clear localStorage.', version);
      localStorage.clear();
      localStorage.setItem('version', version);
    }
  } else {
    localStorage.clear();
    localStorage.setItem('version', version);
  }
})();
