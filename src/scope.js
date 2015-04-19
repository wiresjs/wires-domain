var restResources = {};
var services = {}

module.exports = {
	addRestResource: function(path, handler) {
		restResources[path] = handler;
	},
	addService: function(name, f) {
		services[name] = f;
	},
	getServices: function() {
		return services;
	},
	getRestResources: function() {
		return restResources;
	}
}