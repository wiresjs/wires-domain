var log4js = require('log4js');
var _ = require("lodash");
var express = require('express');
var Promise = require('promise');
var Class = require('wires-class');
var rest = require('./src/rest');
var scope = require('./src/scope');



exports.path = function(path, handler) {
	scope.addRestResource(path, handler);
};

exports.service = function(name, handler) {
	scope.addService(name, handler);
};

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

exports.Exception = require('./src/exception');

exports.logger = log4js.getLogger("domain");