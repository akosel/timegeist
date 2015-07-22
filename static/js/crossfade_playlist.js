var CrossfadePlaylist = function() {};

CrossfadePlaylist.prototype.play = function() {
  var ctx = this;
  var context = this.context;
  playHelper();
  ctx.playing = true;

  function createSource(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
    source.buffer = buffer;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(context.destination);
    return {
      source: source,
      gainNode: gainNode
    };
  }

  function playHelper() {
    ctx.playIdx = ctx.playIdx === ctx.trackList.length - 1 ? 0 : ctx.playIdx;
    if(!ctx.trackList[ctx.playIdx]) {
      arguments.callee();
    }
    if(!ctx.trackList[ctx.playIdx].buffer) {
      ctx.playIdx += 1;
      arguments.callee();
    }

    pub('updateTrackInfo', { nowPlaying: ctx.trackList[ctx.playIdx] });
    pub('addBufferImages', { tracks: ctx.getNextTracks() });
    var bufferNow = ctx.trackList[ctx.playIdx].buffer;
    var playNow = createSource(bufferNow);
    var source = playNow.source;
    ctx.source = source;
    var gainNode = playNow.gainNode;
    ctx.gainNode = gainNode;
    var duration = bufferNow.duration;
    var currTime = context.currentTime;
    // Fade the playNow track in.
    gainNode.gain.linearRampToValueAtTime(0, currTime);
    gainNode.gain.linearRampToValueAtTime(1, currTime + ctx.FADE_TIME);
    // Play the playNow track.
    source.start ? source.start(0) : source.noteOn(0);
    // At the end of the track, fade it out.
    gainNode.gain.linearRampToValueAtTime(1, currTime + duration-ctx.FADE_TIME);
    gainNode.gain.linearRampToValueAtTime(0, currTime + duration);
    // Schedule a recursive track change with the tracks swapped.
    var recurse = arguments.callee;
    ctx.timer = setTimeout(function() {
      ctx.playIdx += 1;
      recurse();
    }, (duration - ctx.FADE_TIME) * 1000);
  }
};

CrossfadePlaylist.prototype.getNextTracks = function(num) {
  num = num || 5;
  var ub = this.trackList.length - 1;
  num = num < ub ? num : ub;

  if (this.playIdx + num - 1 < ub) {
    return this.trackList.slice(this.playIdx + 1, this.playIdx + num);
  } else {
    var tailIndex = this.playIdx - ub;
    var endSlice = this.trackList.slice(tailIndex);
    var beginningSlice = this.trackList.slice(0, num + tailIndex);
    return endSlice.concat(beginningSlice);
  }
};

CrossfadePlaylist.prototype.loadTrack = function(trackObj) {
  this.trackList.push(trackObj);
  if (typeof this.playing === 'undefined') {
    this.switching = false;
    this.play(); 
  } else if (this.switching) {
    this.switching = false;
    playlist.playIdx = 0;
    clearTimeout(this.timer);
    this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
    this.play();
  }
  pub('addBufferImages', { tracks: this.getNextTracks() });
};

CrossfadePlaylist.prototype.stop = function() {
  clearTimeout(this.timer);
  this.playing = false;
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
};

CrossfadePlaylist.prototype.next = function() {
  clearTimeout(this.timer);
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
  this.playIdx += 1;
  this.play();
};

CrossfadePlaylist.prototype.previous = function() {
  clearTimeout(this.timer);
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
  this.playIdx -= 1;
  this.play();
};

CrossfadePlaylist.prototype.playTrack = function(playIdx) {
  clearTimeout(this.timer);
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
  this.playIdx = playIdx;
  this.play();
};

CrossfadePlaylist.prototype.toggle = function() {
  this.playing ? this.stop() : this.play();
};

CrossfadePlaylist.prototype.mute = function() {
  // TODO set gainNode.gain to 0 
};
