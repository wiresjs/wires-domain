var _ = require('lodash');
var async = require('async');
var domain = require('./index');
var scope = require('./scope');
var logger = require('log4js').getLogger("domain");

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;


var services = {};

function getParamNames(func) {
	console.log(func.toString());
	var fnStr = func.toString().replace(STRIP_COMMENTS, '');
	var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
	if (result === null)
		result = [];
	return result;
}


module.exports = {
	callService: function(serviceObject, done) {
		if (_.isFunction(argService)) {
			serviceObject();
		}
	},
	/**
	 * Calling a service function
	 * Considing all injections
	 * @param {[type]} func [description]
	 * @return {[type]}
	 */
	invoke: function(avialableServices, target, callReady) {

		var f;
		var variables;

		// Some workaround.
		// At some point function can't be extract from a method
		// that belongs to a class
		// So it has to be extracted property
		if (_.isPlainObject(target)) {
			if (target["f"]) {
				f = target.f;
			}
			if (target["source"]) {
				variables = getParamNames(target["source"]);
			}
		} else {
			f = target;
			variables = getParamNames(target);
		}

		var services = scope.getServices();

		var args = [];
		var self = this;
		_.each(services, function(s, name) {
			avialableServices[name] = s;
		});


		for (var i in variables) {
			var variableName = variables[i];
			if (!avialableServices[variableName]) {
				return callReady(new domain.errors.Exception("Service with name '" + variableName + "'' was not found", 400), null);
			}
			args.push(avialableServices[variableName]);
		}
		var results = [];

		async.eachSeries(args, function(argService, next) {
			if (_.isFunction(argService)) {
				var serviceResult = self.invoke(avialableServices, argService, function(err, r) {
					results.push(r);
					next(err);
				});
			} else {
				results.push(argService);
				next();
			}
		}, function(err) {
			if (err) {
				// Globally if error happenes, stop it here, before calling function
				return callReady(err, null)
			}

			// Resolving promises if defined
			var functionResult;
			try {
				functionResult = f.apply(results, results);
			} catch (e) {
				logger.info(e);
				callReady(e, null)
			}
			if (_.isObject(functionResult)) {

				var isPromise = _.isFunction(functionResult["then"]) && _.isFunction(functionResult["catch"]);

				if (isPromise) {
					functionResult.then(function(res) {
						if (callReady) {

							callReady(null, res);
						}
					})
					functionResult.catch(function(e) {
						logger.info(e);
						callReady(e, null)
					})
				} else {
					callReady(null, functionResult)
				}
			} else {
				callReady(null, functionResult)
			}


		});
	},
}