var log4js = require('log4js');
var _ = require("lodash");
var Promise = require('promise');
var Class = require('wires-class');
var rest = require('./src/rest');
var Invoke = require('./src/invoker');
var scope = require('./src/scope');

var restServices = require('./src/rest_services');

exports.Exception = require('./src/exception');
exports.Factory = require('./src/factory');
exports.logger = log4js.getLogger("domain");

exports.path = function() {
	var handlers = [];
	var path;
	_.each(arguments, function(item){
		if ( !path ){
			path = item
		} else {
			handlers.push(item);
		}
	});
	_.each(handlers, function(handler){
		scope.addRestResource(path, handler);	
	});
};

exports.service = function(name, handler) {
	scope.addService(name, handler);
};
exports.register = function(name, handler) {
	scope.addService(name, handler);
};

exports.require = function(cb) {
	return Invoke.invoke.apply(Invoke, arguments);
}

exports.promise = function(cb) {
	return new Promise(cb)
}

exports.express = function() {
	return rest;
};

restServices(exports)


