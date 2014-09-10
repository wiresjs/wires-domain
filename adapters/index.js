exports.Base = require('./base');
exports.Memory = require('./memory');
exports.File = require('./file-adapter');
exports.Mysql = require('./mysql_adapter');
exports.current = null;
exports.setAdapter = function(adapter)
{
	this.current = adapter;
}

exports.getCurrent = function(adapter)
{
	return this.current;
}