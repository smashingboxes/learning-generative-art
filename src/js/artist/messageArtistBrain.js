let ArtistBrainWorker = initArtistWorker();

function initArtistWorker() {
  let ArtistBrain = require('worker?inline!./brain-worker');
  let ArtistBrainWorker = new ArtistBrain();
  ArtistBrainWorker.onmessage = function(event) {
    //console.log('Message in Main', event);
    if (ArtistBrainWorker[event.data[0]]) {
      ArtistBrainWorker[event.data[0]].pop().resolve(event.data);
    }
  };
  return ArtistBrainWorker;
}
function messageArtistBrain (messageType, data) {
  return new Promise(function (resolve, reject) {
    if (ArtistBrainWorker[messageType] && ArtistBrainWorker[messageType].reject) {
      //ArtistBrainWorker[messageType].reject(messageType);
    }
    if ( !ArtistBrainWorker[messageType] ) {
      ArtistBrainWorker[messageType] = [];
    }
    ArtistBrainWorker[messageType].push({
      resolve: resolve,
      reject: reject
    });
    ArtistBrainWorker.postMessage( [messageType].concat(data) );
  });
}


module.exports = messageArtistBrain;
