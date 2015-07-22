// pub/sub
var events = {};
events.messageBus = {};
events.pub = function(topic, data) {
  if (!this.messageBus[topic]) return false;
  this.messageBus[topic].forEach(function(callback) {
    callback(data);
  });
  return true;
};
events.sub = function(topic, callback) {
  if (!this.messageBus[topic]) {
    this.messageBus[topic] = [];
  }
  this.messageBus[topic].push(callback);
};
