var collection = require('./collection');
var domain = require('../index.js');
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
// Getting session
var ObtainSession = function(req, done) {
	var session_id = req.cookies['session_id'];
	if (!session_id) {
		done(null);
		return;
	}
	var session = new domain.auth.models.DomainSession();
	// Getting user and permissions
	session.find({
		session_id : session_id
	}).first(function(session) {
		var user_id = session.get("user_id");
		var user = new domain.auth.models.DomainUser();
		user.find({
			id : user_id
		}).first(function(user) {
			if (user) {
				var group_id = user.get("domain_group_id");
				var group = new domain.auth.models.DomainGroup();
				group.find({
					id : group_id
				}).first(function(group) {
					if (group) {
						session.group = group;
						session.user = user;
						done(session);
					} else
						done(null);
				});
			} else
				done(null);
		});
	});
};

// Checking user permissions
var checkPermissions = function(env, handler, method, done) {
	var session = env.session;
	if (!handler.permissions) {
		done(true);
		return;
	};
	var permissionKeys = Object.keys(handler.permissions);
	if (permissionKeys.length > 0) {
		// Get access
		var accessKey = permissionKeys[0];
		var access = handler.permissions[accessKey];
		var accessData = _.isArray(access) || [];
		if ( session ){
			var groupPermissions = session.group.get("permissions");
			
			// If root user -> allow
			if ( groupPermissions.root ){
				done(true);
				return;
			}
			
			if ( _.isArray(groupPermissions.access) ){
				accessData = _.uniq(_.union(accessData, groupPermissions.access));
			}
		}
		// If there is no session, obviously it's fail
		if ( !session ){
			done(false);
		} else {
			
		}
	} else {
		done(true);
	}
};
var Service = function(req, res, next) {
	var url = req.url;
	var params, keys, handler;
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
	ObtainSession(req, function(session) {
		// Parsing parameters
		params = params.splice(1);
		var mergedParams = {};
		_.each(keys, function(data, index) {
			if (params[index] !== null && params[index] !== undefined) {
				var parameterValue = params[index];
				var parameterInteger = parseInt(parameterValue);
				if (!_.isNaN(parameterInteger)) {
					parameterValue = parameterInteger;
				}
				mergedParams[data.name] = parameterValue;
			}
		});
		// Creating abstract parameters that are passed to a model
		var abstractParameters = {
			criteria : mergedParams,
			order : {  },
			limit : 0
		};
		// Setting the environment to be passed to a handler
		var environ = {
			params : abstractParameters,
			req : req,
			res : res,
			session : session
		};
		// Getting target instances
		var ResourceHandler;
		var Model;
		if (_.isFunction(handler)) {
			ResourceHandler = domain.resources.ModelResource;
			Model = handler;
		} else if (_.isObject(handler)) {
			ResourceHandler = handler.handler || domain.resources.ModelResource;
			if (handler.model) {
				Model = handler.model;
			}
			if (handler.filter) {
				handler.filter(environ);
			}
		}
		// Define method
		var method = defineMethod(req);
		checkPermissions(environ, handler, method, function() {
		});
		var handlerInstance = new ResourceHandler(Model);
		// Calling method
		handlerInstance[method](environ);
	});
};
module.exports = Service;
