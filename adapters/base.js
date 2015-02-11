var Class = require('wires-class')
var _ = require('lodash')

var BaseAdapter = Class.extend({

}, {
	setAdapter : function()
	{

	},
	onSetup : function(){

	},
	connect : function(a, b)
	{
		var options = {};
		var fn = function(){};
		if ( _.isPlainObject(a) && _.isFunction(b)){
			options = a;
			fn = b;
		}
		if ( _.isFunction(a)){
			fn = a;
		}
		
		this.onSetup(options, fn);
	},
	count : function(collection, cbs)
    {
    	cbs.success(0);
    },
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