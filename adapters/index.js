exports.Base = require('./base');
exports.Tiny = require('./tiny-adapter')
exports.Mongodb = require('./mongodb-adapter');
exports.Mysql = require('./mysql-adapter');
exports.current = null;
exports.setAdapter = function(adapter)
{
	adapter.setAdapter();
	this.current = adapter;
}

exports.getCurrent = function(adapter)
{
	return this.current;
}