var log4js = require('log4js');
var _ = require("lodash");
var Promise = require('promise');
var Class = require('wires-class');
var rest = require('./src/rest');
var Invoke = require('./src/invoker');
var scope = require('./src/scope');
var async = require('async');
var restServices = require('./src/rest_services');


exports.Exception = require('./src/exception');
exports.Factory = require('./src/factory');
exports.logger = log4js.getLogger("domain");

exports.path = function() {
	var handlers = [];
	var path;
	_.each(arguments, function(item) {
		if (!path) {
			path = item
		} else {
			handlers.push(item);
		}
	});
	_.each(handlers, function(handler) {
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

/*


var promises = [];
			_.each(funcCollection, function(f) {
				promises.push(function(callback) {
					var curFunction = f;
					if (thisArg) {
						curFunction = f.bind(thisArg);
					}
					new Promise(curFunction).then(function(res) {
						callback(null, res);
					}).catch(function(e) {
						callback(e, null);
					});
				});
			});
			async.series(promises, function(err, results) {
				if (err !== undefined) {
					return reject(err);
				} else {
					return resolve(results);
				}
			})


 */


exports.each = function(arr, cb) {
	return new Promise(function(resolve, reject) {
		var promises = [];
		_.each(arr, function(v, k) {
			promises.push(function(callback) {
				var cbRes;
				try {
					cbRes = cb(v, k);
				} catch (e) {
					return callback(e, null)
				}
				if (cbRes instanceof Promise) {
					cbRes.then(function(r) {
						callback(null, r);
					}).catch(function(e) {
						callback(e);
					})
				} else {
					process.nextTick(function() {
						callback(null, cbRes);
					});
				}
			});
		});

		async.series(promises, function(err, results) {
			if (err !== undefined) {
				return reject(err);
			} else {
				return resolve(results);
			}
		})
	});
};


restServices(exports)