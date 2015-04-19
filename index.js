var log4js = require('log4js');
var _ = require("lodash");
var express = require('express');
var scope = require('./src/scope');
var Class = require('wires-class');


exports.logger = log4js.getLogger("domain");
exports.errors = require('./errors');



var restResources = {};


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



exports.express = function() {
	return rest;
};