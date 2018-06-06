var CrossfadePlaylist = function() {};

CrossfadePlaylist.prototype.constructor = CrossfadePlaylist;
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
    if(!ctx.trackList || !ctx.trackList.length) {
      return;
    }
    if (ctx.trackList.length - 1 === ctx.playIdx) {
      ctx.playIdx = 0;
    } else if (ctx.playIdx < 0) {
      ctx.playIdx = ctx.trackList.length - 1;
    }
    if(!ctx.trackList[ctx.playIdx]) {
      arguments.callee();
    }
    if(!ctx.trackList[ctx.playIdx].buffer) {
      ctx.playIdx += 1;
      arguments.callee();
    }

    events.pub('updateTrackInfo', { nowPlaying: ctx.trackList[ctx.playIdx] });
    var bufferNow = ctx.trackList[ctx.playIdx].buffer;
    ctx.buffer = bufferNow;
    var playNow = createSource(bufferNow);
    var source = playNow.source;
    ctx.source = source;
    var gainNode = playNow.gainNode;
    ctx.gainNode = gainNode;
    var duration = ctx._getEffectiveDuration();
    if (ctx.interval) {
      clearInterval(ctx.interval);
    }
    ctx.interval = setInterval(function() {
      ctx.setProgress(ctx._getPercentPlayed());
    }, 50);
    ctx.startedAt = context.currentTime;
    // Fade the playNow track in.
    ctx._setFadeIn();
    // Play the playNow track.
    var startTime = ctx.stoppedAt || 0;
    source.start ? source.start(ctx.context.currentTime, startTime) : source.noteOn(ctx.context.currentTime, startTime);
    // At the end of the track, fade it out.
    ctx._setFadeOut();
    // Schedule a recursive track change with the tracks swapped.
    var recurse = arguments.callee;
    ctx.timer = setTimeout(function() {
      ctx.stoppedAt = undefined;
      ctx.playIdx += 1;
      recurse();
    }, (duration - ctx.FADE_TIME) * 1000);
  }
};

CrossfadePlaylist.prototype._getEffectiveDuration = function() {
  var offset = this.stoppedAt || 0;
  return this.buffer.duration - offset;
};

CrossfadePlaylist.prototype._getPercentPlayed = function() {
  return 1 - (this._getTrackRemaining() / this.buffer.duration);
};

CrossfadePlaylist.prototype._getTrackRemaining = function() {
  var currTime = this.context.currentTime;
  var duration = this._getEffectiveDuration();
  var trackLeft = duration - (currTime - this.startedAt);
  return trackLeft;
};

CrossfadePlaylist.prototype._setFadeIn = function() {
    var currTime = this.context.currentTime;

    this.gainNode.gain.linearRampToValueAtTime(0, currTime);
    this.gainNode.gain.linearRampToValueAtTime(.7, currTime + this.FADE_TIME);
};

CrossfadePlaylist.prototype._setFadeOut = function() {
  var currTime = this.context.currentTime;
  var duration = this._getEffectiveDuration();
  var trackLeft = duration - (currTime - this.startedAt);

  this.gainNode.gain.linearRampToValueAtTime(.7, currTime + trackLeft - this.FADE_TIME);
  this.gainNode.gain.linearRampToValueAtTime(0, currTime + trackLeft);
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
    try {
      this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
    } catch(e) {
      console.log(e);
    }
    this.play();
  }
};

CrossfadePlaylist.prototype.stop = function() {
  clearTimeout(this.timer);
  clearTimeout(this.interval);
  this.stoppedAt = this.buffer.duration - this._getTrackRemaining();
  this.playing = false;
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
};

CrossfadePlaylist.prototype.next = function() {
  clearTimeout(this.timer);
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
  this.stoppedAt = undefined;
  this.playIdx += 1;
  this.play();
};

CrossfadePlaylist.prototype.previous = function() {
  clearTimeout(this.timer);
  this.source.stop ? this.source.stop(0) : this.source.noteOff(0);
  this.stoppedAt = undefined;
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
  this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
  this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
};

CrossfadePlaylist.prototype.unmute = function() {
  this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
  this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
  this._setFadeOut();
};
