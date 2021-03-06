var Require = require("./src/_require.js")
var Each = require("./src/_each.js");
var Restful = require("./src/_restful");
var Convinience = require("./src/_convenience");
var Transpile = require("./src/transpile");
module.exports = {
	// Core function
	require: Require.require.bind(Require),
	// Tells if services is registered in the global runtime
	isServiceRegistered: Require.isServiceRegistered.bind(Require),
	// Register new service
	service: Require.service.bind(Require),

	module: Require.module.bind(Require),

	requirePackage: Require.requirePackage.bind(Require),
	// Factory
	Factory: Require.Factory,
	// Register (service)
	register: Require.register.bind(Require),
	// Shortcut to promise
	promise: Require.promise.bind(Require),
	// Register path
	path: Restful.path,

	transpile: Transpile,

	convenience: Convinience,
	// Express handler
	express: Restful.express,
	// Helpers*****

	// Smart each operator
	each: Each
};
