var _ = require('lodash');
var async = require('async');
var domain = require('../index');
var scope = require('./scope');
var logger = require('log4js').getLogger("domain");

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;


var services = {};

function getParamNames(func) {
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
	constructModel: function(avialableServices, functionResult, done) {

		var domainModelInstance = new functionResult();

		this.invoke(avialableServices, {
			source: functionResult.prototype.init,
			f: domainModelInstance["init"],
			instance: domainModelInstance
		}, function(err, r) {

			done(err, domainModelInstance);
		});
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
		var instance;



		// Some workaround.
		// At some point function can't be extract from a method
		// that belongs to a class
		// So it has to be extracted property
		if (_.isPlainObject(target)) {
			if (target["f"]) {
				f = target.f;
			}
			if (target.instance) {
				instance = target.instance;
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
				return callReady(new domain.Exception("Service with name '" + variableName + "'' was not found", 400), null);
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
				functionResult = f.apply(instance || results, results);
			} catch (e) {
				logger.info(e);
				callReady(e, null)
			}

			if (_.isObject(functionResult)) {
				// Check special property of a function to destinuish if it's out guy
				var isDomainModel = functionResult.__domain_model__;

				if (isDomainModel) {
					// Construct model and init it
					self.constructModel(avialableServices, functionResult, function(err, newinstance) {
						if (err) {
							callReady(err, null)
						} else {
							callReady(null, newinstance)
						}
					});
				} else {

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
				}
			} else {
				callReady(null, functionResult)
			};


		});
	},
}