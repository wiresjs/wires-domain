var domain = require('../index.js');
var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');
var invoker = require('./invoker');
var scope = require('./scope');

var defineMethod = function(req) {
	var method = req.query.method ? req.query.method : req.method;
	switch (method) {
		case 'GET':
			return 'index';
		case 'POST':
			return 'add';
		case 'PUT':
			return 'update';
		case 'DELETE':
			return 'remove';
	}
};

module.exports = function(req, res, next) {
	var params, keys, handler;
	var url = req.path;
	var resources = scope.getRestResources();
	_.each(resources, function(resourceHandler, path) {
		keys = [];
		handler = resourceHandler;
		var re = pathToRegexp(path, keys);
		params = re.exec(url);
		if (params)
			return false;
	});


	// No resource handler - skip
	if (!params) {
		next();
		return;
	};

	// Extract params 
	var mergedParams = {};

	_.each(keys, function(data, index) {
		var i = index + 1;
		if (params[i] !== null && params[i] !== undefined) {
			var parameterValue = params[i];
			if (parameterValue.match(/^\d{1,4}$/)) {
				parameterValue = parseInt(parameterValue);
			}
			mergedParams[data.name] = parameterValue;
		}
	});


	var method = defineMethod(req);
	var resourceInstance = new handler();

	// Checking is conventions are followed
	var isValidResource = resourceInstance instanceof domain.BaseResource;

	// Define parse options
	var parseOptions = {};
	if (isValidResource) {
		parseOptions.source = handler.prototype[method];
		parseOptions.f = resourceInstance[method];
	}
	// in case if it's just a function
	else {
		parseOptions = handler;
	}

	invoker.invoke({
		$req: req,
		$res: res,
		$params: mergedParams
	}, parseOptions, function(err, result) {

		if (err) {
			var errResponse = {
				status: 500,
				message: "Error"
			};
			if (_.isObject(err)) {
				errResponse.status = err.status || 500;
				errResponse.message = err.message || "Error";
				if (err.details) {
					errResponse.details = err.details;
				}
			}
			res.status(errResponse.status).send(errResponse);
		}
	});

};