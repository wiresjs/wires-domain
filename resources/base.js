var Class = require('wires-class');
var _ = require('lodash');

var BaseResource = Class.extend({
	initialize : function() {
		_.bindAll(this);
	},
	index : function(env) {
		env.res.send({
			error : 'Not implemented'
		},501);
	},
	// new record
	add : function(env) {
		env.res.send({
			error : 'Not implemented'
		},501);
	},
	// update
	update : function(env) {
		env.res.send({
			error : 'Not implemented'
		},501);
	},
	// remove
	remove : function(env) {
		env.res.send({
			error : 'Not implemented'
		},501);
	}
});

module.exports = BaseResource;