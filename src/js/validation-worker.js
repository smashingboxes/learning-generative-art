onmessage = function(e) {
  //console.log('Message received from main script');

  let pixels = e.data[0];
  let result = {};
  let fullLength = pixels.length/4;
  let index = -1;
  let largestPool = 0;


  var _limit = pixels.reduce(function (result, current, index, arr) {
    if ( index && index % 4 === 0 ) {
      let track = {name:'',}
      let name = 'r'+ '' +arr[index-1]+ 'g' +arr[index-2]+ 'b' +arr[index-3];
      if ( !result[name] ) result[name] = 0;
      result[name]++;
      if (largestPool < result[name] ) {
        largestPool = result[name];
      }
    }
    return result;
  }, {});

  //console.log('Posting message back to main script', pixels.length, largestPool/fullLength);
  postMessage([largestPool/fullLength]);
}
