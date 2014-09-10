exports.adapters = require('./adapters');
exports.models  = require('./models');
exports.resources  = require('./resources');
exports.test  = require('./test');
exports.errors  = require('./errors');
exports.rest  = require('./rest');
exports.auth  = require('./auth');


exports.setAdapter = function(adapter)
{
	this.adapters.setAdapter( adapter );
};