function init() {

  window.cache = {};
  window.bufferLoader, window.playlist;

  var $main = document.querySelector('main');
  var $userYearButton = $main.querySelector('.btn-user-year');
  var $randomYearButton = $main.querySelector('.btn-random-year');
  var $input = $main.querySelector('#year');
  var $play = $main.querySelector('#play');
  var $previous = $main.querySelector('#back');
  var $next = $main.querySelector('#next');
  var $volume = $main.querySelector('#volume');
  var $trackInfo = $main.querySelector('.track-info');
  var $trackList = $main.querySelector('.track-list');
  var setProgress = progress();

  window.activeYear = undefined;

  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();

  playlist = Object.create(CrossfadePlaylist.prototype, {
    FADE_TIME: {
      value: 1
    }, // Seconds
    playing: {
      value: undefined,
      writable: true
    },
    playIdx: {
      value: 0,
      writable: true
    },
    trackList: {
      value: [],
      writable: true
    },
    context: {
      value: context,
      writable: true
    },
    setProgress: {
      value: setProgress,
      writable: false
    }
  });

  bufferLoader = Object.create(BufferLoader.prototype, {
    context: {
      value: context,
      writable: true
    },
    trackList: {
      value: [],
      writable: true
    },
    onload: {
      value: playlist.loadTrack.bind(playlist)
    },
    activeYear: {
      value: parseInt(activeYear),
      writable: true
    }
  });
  events.sub('yearChange', function(data) {
    playlist.switching = true;
    bufferLoader.activeYear = parseInt(data.year);
  });
  events.pub('sendMessage', { message: '', elType: 'h1' });

  // XXX slight hack/necessity to allow sound to play in iOS
  document.querySelector('body').addEventListener('touchstart', playSound, false);

  // XXX Truly temporary
  function playSound(buffer) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
                                               // note: on older systems, may have to use deprecated noteOn(time);
  }

  // TODO add this to the interface. It's kind of a cool feature
  var coastMode = false;
  var coasting = setInterval(function() {
    if (coastMode) {
      $input.value = parseInt(activeYear) < 2014 ? parseInt(activeYear) + 1 : 1900;
      fireItUp();
    } else {
      clearInterval(coasting);
    }
  }, 30000);

  document.onkeyup = function(e) {
    if (e.keyCode === 13) {
      if (activeYear !== parseInt($input.value)) {
        fireItUp();
      }
    } else if (e.keyCode === 32) {
      if (activeYear !== parseInt($input.value)) {
        playlist.toggle();
      }
    }
  };

  function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function togglePlayPauseButton() {
    var $btn = $play.querySelector('i');
    if ($btn.classList.contains('fa-play')) {
      setPlayPauseButton('fa-pause');
    } else {
      setPlayPauseButton('fa-play');
    }
  }

  function setControlClass($btn, toAdd, toRemove) {
    $btn.classList.remove(toRemove);
    $btn.classList.add(toAdd);
  }

  function setPlayPauseButton(className) {
    var $btn = $play.querySelector('i');
    var toRemove = className === 'fa-play' ? 'fa-pause' : 'fa-play';
    setControlClass($btn, className, toRemove);
  }

  function contextResumeEventListenerWrapper(cb) {
    return function(event) {
      context.resume().then(cb.apply(this, arguments));
    };
  }

  $volume.addEventListener('click', contextResumeEventListenerWrapper(function(event) {
    var $btn = $volume.querySelector('i');
    var toAdd = $btn.classList.contains('fa-volume-up') ? 'fa-volume-off' : 'fa-volume-up';
    var toRemove = $btn.classList.contains('fa-volume-up') ? 'fa-volume-up' : 'fa-volume-off';
    setControlClass($btn, toAdd, toRemove);
    if (toAdd === 'fa-volume-up') {
       playlist.unmute();
    } else {
       playlist.mute();
    }
  }));

  $randomYearButton.addEventListener('click', contextResumeEventListenerWrapper(function(event) {
    context.resume().then(() => {
        $input.value = getRandomArbitrary(1899, 2014);
        if (activeYear !== parseInt($input.value)) {
        setPlayPauseButton('fa-pause');
        fireItUp();
        }
    });
  }));

  $play.addEventListener('click', contextResumeEventListenerWrapper(function(event) {
    if (activeYear !== parseInt($input.value)) {
      setPlayPauseButton('fa-pause');
      fireItUp();
    } else {
      togglePlayPauseButton();
      playlist.toggle();
    }
  }));

  $userYearButton.addEventListener('click', contextResumeEventListenerWrapper(function(event) {
    if (activeYear !== parseInt($input.value)) {
      setPlayPauseButton('fa-pause');
      fireItUp();
    }
  }));

  $previous.addEventListener('click', function(event) {
    playlist.previous();
  });

  $next.addEventListener('click', function(event) {
    playlist.next();
  });

  function fireItUp() {
    if (!$input.validity.valid) {
      console.log('The input is invalid.');
      return false;
    }
    activeYear = parseInt($input.value);
    events.pub('yearChange', { year: activeYear });

    events.pub('clearTrackInfo');
    events.pub('sendMessage', { message: 'Welcome to ' + activeYear + ' - ' + getMessageForYear(activeYear), elType: 'h1' });
    searchTracks($input.value, function(trackList) {
      trackList = trackList.filter(function(track) {
        return track.url;
      });

      playlist.trackList = [];
      playlist.stoppedAt = undefined;
      bufferLoader.trackList = shuffle(trackList);
      bufferLoader.load();
    });
  }

  events.sub('updateTrackInfo', function(args) {
    var track = args.nowPlaying;
    var $name = $trackInfo.querySelector('.track-name');
    var $artist = $trackInfo.querySelector('.track-artist');
    $name.textContent = track.name;
    $artist.textContent = track.artist;
    document.title = track.name;
  });

  events.sub('clearTrackInfo', function() {
    [].forEach.call($trackInfo.querySelectorAll('p, h1'), function($p) {
      $p.textContent = '';
    });

  });

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  function searchTracks(year, callback) {
    var trackList;
    if (window.cache && window.cache.songs && typeof window.cache.songs[year] !== 'undefined') {
      var trackList = window.cache.songs[year].slice();
      callback(trackList);
    } else {
      api.getSongs(year, function(xhr) {
        trackList = JSON.parse(xhr.responseText);
        callback(trackList);
      });
    }
  };

  window.cache.songs = {};
}
