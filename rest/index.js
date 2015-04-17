exports.Service = require('./service');
exports.Collection = require('./collection');
exports.Simple = require('./simple');

exports.Path = function(path, properties) {
	exports.Collection.register(path, properties);
};