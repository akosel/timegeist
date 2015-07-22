var api = {};

api.getEvents = function(year) {
  if (!year) return;

  var json, msgIdx;
  get('/api/v1.0/events/' + year, function(xhr) {
    json = JSON.parse(xhr.responseText);
    if (json.status === 'empty') {
      // TODO not sure what to do in this case
    } else {
      msgIdx = Math.round(Math.random() * (json.length - 1));
      pub('sendMessage', { content: json[msgIdx][1] });
    }
  });
}

api.getSongs = function(year, callback) {
  if (!year) return;

  get('/api/v1.0/songs/' + year, function(xhr) {
    callback(xhr);
  });
}

function get(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200 && callback) {
      callback(xhr);
    }
  }
  xhr.send();
}
