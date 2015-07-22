// pub/sub
var messageBus = {};
var pub = function(topic, data) {
  if (!messageBus[topic]) return false;
  messageBus[topic].forEach(function(callback) {
    callback(data);
  });
  return true;
};
var sub = function(topic, callback) {
  messageBus[topic] = [];
  messageBus[topic].push(callback);
};
