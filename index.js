/**
 * Module dependencies.
 */
var debug = require('debug')('glint-trigger');
var merge = require('utils-merge');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

/**
 * Expose `Trigger`
 */
exports = module.exports = Trigger;
inherits(Trigger, EventEmitter);

/**
 * `Trigger` constructor function.
 */
function Trigger(options) {
  if (!(this instanceof Trigger)) return new Trigger(options);
  this.c = this.c || {};
  merge(this.c, options);
  this.sinks = [];
}

/**
 * API functions.
 */
Trigger.prototype.api = Trigger.api = 'trigger';

Trigger.prototype.add = function (sink) {
  if (this.find(sink)) return;
  this.sinks.push(sink);
  this.emit('add', sink);
};

Trigger.prototype.remove = function (sink) {
  var i = this.indexOf(sink);
  if (!~i) return;
  this.sinks.splice(i, 1);
  this.emit('remove', sink);
};

Trigger.prototype.find = function (sink) {
  var identifier = (typeof sink == 'string') ? sink : sink.identifier;
  if (!identifier || identifier.length == 0) {
    // compare objects
    return this.sinks.filter(function (s) {
      return sink == s;
    })[0];
  } else {
    // compare objects identifier string
    return this.sinks.filter(function (s) {
      return identifier == s.identifier;
    })[0];
  }
};

Trigger.prototype.indexOf = function (sink) {
  var s = this.find(sink);
  return this.sinks.indexOf(s);
};

Trigger.prototype.callFunction = function (functionName, args, fn) {
  var self = this;
  this.emit(functionName, args);
  this.sinks.forEach(function (sink) {
    if (typeof sink[functionName] == 'function') {
      var result = sink[functionName](args);
      debug('trigger callFunction', functionName);
      if (fn) fn(sink, result);
      self.emit('post-' + functionName, args, sink, result);
    }
  });
  return this;
};
