// Nice helpers from http://www.html5rocks.com/en/tutorials/webaudio/intro/
function BufferLoader() {}
BufferLoader.prototype.constructor = BufferLoader;
BufferLoader.prototype.loadBuffers = function(trackList, firstRun) {
  var loader = this;
  events.sub('buffer.clearList', function(data) {
    loader.bufferCount = 0;
    trackList = [];
  });
  if (!trackList || !trackList.length) {
    return;
  }
  if (loader.bufferCount >= 5) {
    setTimeout(function() {
        loader.bufferCount -= 1;
        loader.loadBuffers(trackList, firstRun);
    }, 10000);
    return;
  }
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  var trackObj = trackList.pop();
  request.open("GET", trackObj.preview_url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + trackObj.preview_url);
          return;
        }
        loader.bufferCount += 1;
        trackObj.buffer = buffer;
        if (trackObj.year === loader.activeYear) {
          loader.onload(trackObj);
        }
        loader.loadBuffers(trackList, firstRun);
      },
      function(error) {
        console.log('decodeAudioData error', error);
        loader.loadBuffers(trackList, firstRun);
      }
    );
  }
  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }
  request.send();
};
BufferLoader.prototype.load = function() {
  var self = this;
  this.urlList = this.trackList
    .filter(function(track) {
      return track.preview_url;
    });

  events.pub('buffer.clearList', {});
  this.bufferCount = 0;
  this.loadBuffers(this.urlList, true);
};
