var api = {};

api.getEvents = function(year, callback) {
  if (!year) return;

  var json, msgIdx;
  this.get('/api/v1.0/events/' + year, function(xhr) {
    json = JSON.parse(xhr.responseText);
    if (json.status === 'empty') {
      // TODO not sure what to do in this case
    } else {
      msgIdx = Math.round(Math.random() * (json.length - 1));
      events.pub('sendMessage', { content: json[msgIdx][1] });
    }
    if (callback) {
      callback(json);
    }
  });
}

api.getSongs = function(year, callback) {
  if (!year) return;

  this.get('/api/v1.0/songs/' + year, function(xhr) {
    callback(xhr);
  });
}

api.get = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200 && callback) {
      callback(xhr);
    }
  }
  xhr.send();
}
