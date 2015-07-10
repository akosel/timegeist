// Nice helpers from http://www.html5rocks.com/en/tutorials/webaudio/intro/
function BufferLoader(context, trackList, callback) {
  this.context = context;
  this.onload = callback;
  this.trackList = trackList;
}
BufferLoader.prototype.loadBuffer = function(trackObj, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
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
        if (index === 0) {
          if (playlist.playing) {
            playlist.stop();
          }
          playlist.play();
        } else if (index === loader.trackList.length - 1) {
          console.log('done loading')
          playlist.loading = false;
        }
        playlist.loadTrack(trackObj);
      },
      function(error) {
        console.log('decodeAudioData error', error);
      }
    );
  }
  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }
  request.send();
};
BufferLoader.prototype.load = function() {
  playlist.loading = true;
  this.urlList = this.trackList
    .filter(function(track) {
      return track.preview_url;
    });
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};
