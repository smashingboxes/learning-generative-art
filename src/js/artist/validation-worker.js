var isBusy = false;

onmessage = function(e) {
  //console.log('Message received from main script');
  if (isBusy) {
    return;
  }
  isBusy = true;

  let pixels = e.data[0];
  let fullLength = pixels.length/4;
  let largestPool = 0;

  pixels.reduce(function (result, current, index, arr) {
    if ( index && index % 4 === 0 ) {
      //let track = {name:''};
      let name = 'r'+ '' +arr[index-1]+ 'g' +arr[index-2]+ 'b' +arr[index-3];
      if ( !result[name] ) result[name] = 0;
      result[name]++;
      if (largestPool < result[name] ) {
        largestPool = result[name];
      }
    }
    return result;
  }, {});

  isBusy = false;
  //console.log('Posting message back to main script', pixels.length, largestPool/fullLength);
  postMessage([largestPool/fullLength]);
}
