// Nice helpers from http://www.html5rocks.com/en/tutorials/webaudio/intro/
function BufferLoader(context, trackList, callback) {
  this.context = context;
  this.onload = callback;
  this.trackList = trackList;
}
BufferLoader.prototype.loadBuffers = function(trackList, firstRun) {
  sub('buffer.clearList', function(data) {
    trackList = [];
  });
  if (!trackList || !trackList.length) {
    return;
  }
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  console.log(trackList);
  var trackObj = trackList.pop();
  console.log(trackObj);
  request.open("GET", trackObj.preview_url, true);
  request.responseType = "arraybuffer";
  var loader = this;
  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + trackObj.preview_url);
          return;
        }
        trackObj.buffer = buffer;
        console.log(trackObj.year, activeYear);
        if (trackObj.year === activeYear) {
          playlist.loadTrack(trackObj);
        }
        if (firstRun) {
          if (playlist.playing) {
            playlist.stop();
          }
          playlist.play();
          firstRun = false;
        } else if (!loader.trackList.length) {
          pub('bufferLoader.doneLoading', {});
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
  sub('bufferLoader.doneLoading', function(data) { console.log('done', data); });
  this.urlList = this.trackList
    .filter(function(track) {
      return track.preview_url;
    });

  pub('buffer.clearList', {});
  this.loadBuffers(this.urlList, true);
};
