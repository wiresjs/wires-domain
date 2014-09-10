exports.Service = require('./service');
exports.Collection = require('./collection');

exports.Path =function(path, properties){
	exports.Collection.register(path, properties);
};
