var log4js = require('log4js');
var _ = require("lodash");
var express = require('express');
var Promise = require('promise');
var Class = require('wires-class');
var rest = require('./src/rest');
var Invoke = require('./src/invoker');
var scope = require('./src/scope');


exports.Exception = require('./src/exception');
exports.Factory = require('./src/factory');
exports.logger = log4js.getLogger("domain");

exports.path = function(path, handler) {
	scope.addRestResource(path, handler);
};

exports.service = function(name, handler) {
	scope.addService(name, handler);
};


exports.getService = function(serviceName, callback) {

}

exports.require = function(cb) {
	Invoke.invoke.apply(Invoke, arguments);
}

exports.BaseResource = Class.extend({
	initialize: function() {
		_.bindAll(this);
	},
	index: function(env) {
		env.res.send({
			error: 'Not implemented'
		}, 501);
	},
	// new record
	add: function(env) {
		env.res.send({
			error: 'Not implemented'
		}, 501);
	},
	// update
	update: function(env) {
		env.res.send({
			error: 'Not implemented'
		}, 501);
	},
	// remove
	remove: function(env) {
		env.res.send({
			error: 'Not implemented'
		}, 501);
	}
});


exports.promise = function(cb) {
	return new Promise(cb)
}

exports.express = function() {
	return rest;
};