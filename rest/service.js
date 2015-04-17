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
var ObtainSession = function(req, res, done) {
	var session_id = req.cookies['session_id'];
	if (!session_id) {
		done(null);
		return;
	}
	var session = new domain.auth.models.DomainSession();
	// Getting user and permissions
	session.find({
		session_id: session_id
	}).first({
		success: function(session) {
			if (!session) {
				done(null);
				return;
			}
			var user_id = session.get("user_id");
			var user = new domain.auth.models.DomainUser();
			user.find({
				id: user_id
			}).first(function(user) {
				if (user) {
					var group_id = user.get("domain_group_id");
					var group = new domain.auth.models.DomainGroup();
					group.find({
						id: group_id
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
		},
		error: function(e) {
			res.status(500).send(e);
		}
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

		var accessData = _.isArray(access) ? access : [];

		if (session) {

			var groupPermissions = session.group.get("permissions");

			// If root user -> allow
			if (groupPermissions.root) {
				done(true);
				return;
			}
			// Merging default given permissions with db permissions
			var dbAccess = groupPermissions.access && _.isArray(groupPermissions.access[accessKey]) ? groupPermissions.access[accessKey] : [];
			accessData = _.uniq(_.union(accessData, dbAccess));

			// In our case default permissions could look like:
			// permissions : { users : ['add', 'update', 'remove'] } }
			//
			// And group permissions:
			// "access" : { "users": ["index"] }
			//
			// After the merge, it will look like:
			// ['add', 'update', 'remove', 'index']

			// So we assume, that all the methods are allowed

			if (_.indexOf(accessData, method) > -1) {
				done(true);
			} else {
				done(false);
			}
		}
		// If there is no session, obviously it's fail
		if (!session) {
			done(false);
		} else {

		}
	} else {
		done(true);
	}
};


var Service = function(req, res, next) {
	var url = req.path;

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
	ObtainSession(req, res, function(session) {
		// Parsing parameters
		params = params.splice(1);
		var mergedParams = {};
		_.each(keys, function(data, index) {
			if (params[index] !== null && params[index] !== undefined) {
				var parameterValue = params[index];
				if (parameterValue.match(/^\d{1,4}$/)) {
					parameterValue = parseInt(parameterValue);
				}
				mergedParams[data.name] = parameterValue;
			}
		});
		// Creating abstract parameters that are passed to a model
		var abstractParameters = {
			criteria: mergedParams,
			order: {},
			limit: 0,
			prepare: _.isObject(handler) ? handler.prepare : null
		};

		// Setting the environment to be passed to a handler
		var environ = {
			params: abstractParameters,
			req: req,
			res: res,
			session: session
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

		checkPermissions(environ, handler, method, function(result) {

			if (!result) {
				res.send({
					error: 'Insufficient Permissions'
				}, 501);
			} else {
				var handlerInstance = new ResourceHandler(Model);
				// Calling method
				handlerInstance[method](environ);
			}
		});

	});
};
module.exports = Service;