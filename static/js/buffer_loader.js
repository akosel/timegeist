// Nice helpers from http://www.html5rocks.com/en/tutorials/webaudio/intro/
function BufferLoader() {}
BufferLoader.prototype.constructor = BufferLoader;
BufferLoader.prototype.reset = function() {
  while (this.timeouts.length) {
    clearTimeout(this.timeouts.pop());
  }
  while (this.requests.length) {
    this.requests.pop().abort();
  }
};
BufferLoader.prototype.loadBuffers = function() {
  const loaded = this.trackList.filter(function(track) {
    return track.buffer;
  });
  console.log(loaded.map(t => t.name));
  const backoff = Math.min(loaded.length * 1000, 5000);
  console.log('backoff', loaded.length, backoff);
  this.timeouts.push(setTimeout(this._loadBuffers.bind(this), backoff));
}
BufferLoader.prototype._loadBuffers = function() {
  var loader = this;
  if (!this.urlList || !this.urlList.length) {
    return;
  }
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  this.requests.push(request);
  var trackObj = this.urlList.pop();
  request.open("GET", trackObj.url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    console.log('year', trackObj.year);
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + trackObj.url);
          return;
        }
        trackObj.buffer = buffer;
        if (trackObj.year === loader.activeYear) {
          loader.onload(trackObj);
        }
        loader.loadBuffers();
      },
      function(error) {
        console.log('decodeAudioData error', error);
        loader.loadBuffers();
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
      return track.url;
    });

  events.pub('buffer.clearList', {});
  this.loadBuffers();
};
