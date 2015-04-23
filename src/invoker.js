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

		this.invoke({
			source: functionResult.prototype.init,
			target: domainModelInstance["init"],
			instance: domainModelInstance
		}, avialableServices).then(function(result) {
			done(null, domainModelInstance)
		}).catch(function(e) {
			done(e);
		})
	},
	getInputArguments: function(args) {
		var out = {};

		out.localServices = {};

		if (args.length > 0) {
			out.source = args[0]; //_.isFunction(args[0]) ? args[0] : out.source;
			out.target = args[0];


			if (_.isPlainObject(args[0])) {
				var opts = args[0];
				out.target = opts.target
				out.source = opts.source
				out.instance = opts.instance
			}

			// call(func, callback)
			if (args.length > 1) {
				if (_.isFunction(args[1])) {
					out.callReady = args[1];
				}
				if (_.isPlainObject(args[1])) {
					out.localServices = args[1];
				}
			}
			// call(func, {locals}, calback)
			if (args.length === 3) {

				if (_.isPlainObject(args[1])) {
					out.localServices = args[1];
				}
				if (_.isFunction(args[2])) {
					out.callReady = args[2]
				}
			}
		}

		out.target = out.target || function() {

		}
		out.source = out.source ? out.source : out.target;
		out.callReady = out.callReady || function() {

		};

		return out;

	},



	/**
	 * Calling a service function
	 * Considing all injections
	 * @param {[type]} func [description]
	 * @return {[type]}
	 */
	invoke: function() {


		var args = this.getInputArguments(arguments);
		var localServices = args.localServices;
		var variables = getParamNames(args.source);
		var target = args.target;
		var callReady = args.callReady;
		var instance = args.instance;
		var globalServices = scope.getServices();

		var resultPromise = new Promise(function(resolve, reject) {

			var args = [];
			var self = this;

			var avialableServices = _.merge(localServices, globalServices);


			for (var i in variables) {
				var variableName = variables[i];
				if (!avialableServices[variableName]) {
					console.log("SHOULD REJECT");
					//reject(new domain.Exception("Service with name '" + variableName + "'' was not found", 400));
					//rej
					reject({
						aa: "FUCKER"
					})
					return;
				}
				args.push(avialableServices[variableName]);
			}
			var results = [];


			async.eachSeries(args, function(argService, next) {

				if (_.isFunction(argService)) {

					self.invoke(argService, localServices).then(function(r) {
						results.push(r)
						console.log("THEN ");
						next(null);
					}).catch(function(e) {
						console.log("REJECTED");
						next(e);
					});
				} else {
					results.push(argService);
					next();
				}
			}, function(err) {

				if (err) {
					// Globally if error happenes, stop it here, before calling function
					return reject(err);
				}

				// Resolving promises if defined
				var functionResult;

				try {
					functionResult = target.apply(instance || results, results);
				} catch (e) {
					logger.info(e);
					return reject(e)
				}

				if (_.isObject(functionResult)) {
					// Check special property of a function to destinuish if it's out guy
					var isDomainModel = functionResult.__domain_factory__;

					if (isDomainModel) {

						// Construct model and init it
						self.constructModel(avialableServices, functionResult, function(err, newinstance) {
							if (err) {
								return reject(err);
							} else {
								return resolve(newinstance);
							}
						});
					} else {

						var isPromise = _.isFunction(functionResult["then"]) && _.isFunction(functionResult["catch"]);

						if (isPromise) {
							functionResult.then(function(res) {
								return resolve(res);
							});
							functionResult.catch(function(e) {
								logger.info(e);
								return reject(e);
							})
						} else {
							return resolve(functionResult);
						}
					}
				} else {
					return resolve(functionResult);
				};
			});
		})
		return resultPromise;
	},
}