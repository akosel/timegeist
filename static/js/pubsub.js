// pub/sub
var messageBus = {};
var pub = function(topic, data) {
  messageBus[topic].forEach(function(callback) {
    callback(data);
  });
};
var sub = function(topic, callback) {
  messageBus[topic] = [];
  messageBus[topic].push(callback);
};
