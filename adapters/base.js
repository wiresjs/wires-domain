var Class = require('wires-class')
var _ = require('lodash')

var BaseAdapter = Class.extend({

}, {
	fetch : function(collection, opts) {
		// opts.criteria
		// opts.order
		// opts.group
		// opts.limit
		// opts.offset
		return this;
	},
	insert : function(collection, values) {
		return {};
	},
	update : function(collection, id, values) {

	},
	remove : function(collection, id)
	{
		
	}
})

module.exports = BaseAdapter;