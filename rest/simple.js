var collection = require('./collection');
var domain = require('../index.js');
var service = require('../service');
var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');

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
	_.each(collection.handlers, function(opts, path) {
		keys = [];
		var re = pathToRegexp(path, keys);
		handler = opts;
		params = re.exec(url);
		if (params)
			return false;
	});
	// No resource handler - skip
	if (!params) {
		next();
		return;
	};

	var method = defineMethod(req);
	var resourceInstance = new handler();

	// Checking is conventions are followed
	var isValidResource = resourceInstance instanceof domain.resources.BaseResource;

	// Define parse options
	var parseOptions = {};
	if (isValidResource) {
		parseOptions.source = handler.prototype[method];
		parseOptions.f = resourceInstance[method];
	}
	// in case if it's just a function
	else {
		parseOptions = handler
	}

	domain.service.invoke({
		$req: req,
		$res: res
	}, parseOptions, function(err, result) {

		if (err) {
			var errResponse = {
				status: 500,
				message: "Error"
			}
			if (_.isObject(err)) {
				errResponse.status = err.status || 500;
				errResponse.message = err.message || "Error"
				if (err.details) {
					errResponse.details = err.details;
				}
			}
			res.status(errResponse.status).send(errResponse);
		}
	});

}