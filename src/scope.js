var restResources = [];
var services = {}

module.exports = {
	addRestResource: function(path, handler) {
		restResources.push({
			path: path,
			handler: handler
		});
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