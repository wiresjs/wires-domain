var BaseAdapter = require('./base');
var _ = require('lodash');
var MemoryAdapter = BaseAdapter.extend({
}, {
	collections : {},
	getCollection : function(name) {
		if (!this.collections[name])
			this.collections[name] = { sequence : 0, data : [] };
		return this.collections[name];
	},
	fetch : function(collection, opts, cbs) {
		var collection = this.getCollection(collection.name).data;
		if (opts.criteria) {
			if (Object.keys(opts.criteria).length > 0)
				collection = _.where(collection, opts.criteria);
		};
		// Orders by
		if (opts.orderBy) {
			_.each(opts.orderBy, function(settings) {
				collection = _.sortBy(collection, function(item) {
					var value = item[settings.key];
					var direction = settings.direction === 'asc' ? 1 : -1;
					
					if (_.isNumber(value))
						return value * direction;
					return value.charCodeAt() * direction;
				});
			});
		};
		// Limits
		if ( opts.limit ){
			if ( _.isNumber(opts.limit) ){
				if (opts.limit > 0 ){
					if ( collection.length > 0 ){
						collection.splice(opts.limit, collection.length);	
					}
				}
			}
		}
		try {
			cbs.success(collection);
		} catch (e) {
			cbs.error(e);
		}
		// opts.criteria
		// opts.order
		// opts.group
		// opts.limit
		// opts.offset
		return this;
	},
	insert : function(collection, values, cbs) {
		var collection = this.getCollection(collection.name);
		
		collection.sequence++;
		values.id = collection.sequence;
		collection.data.push(values);
		try {
			cbs.success(values);
		} catch (e) {
			cbs.error(e);
		}
	},
	update : function(collection, id, values, cbs) {
		var collection = this.getCollection(collection.name).data;
		model = _.where(collection, {
			id : id
		});
		model = model.length > 0 ? model[0] : null;
		if (model) {
			var index = collection.indexOf(model);
			model = values;
			collection[index] = model;
			try {
				cbs.success(collection);
			} catch (e) {
				cbs.error(e);
			}
		} else {
			cbs.success({});
		}
	},
	remove : function(coll, id, cbs) {
		var collectionName = coll.name;
		var collection = this.getCollection(collectionName).data;
		model = _.where(collection, {
			id : id
		});
		model = model.length > 0 ? model[0] : null;
		if (model) {
			var index = collection.indexOf(model);
			this.collections[collectionName].data.splice(index, 1);
			try {
				cbs.success({});
			} catch (e) {
				cbs.error(e);
			}
		} else {
			try {
				cbs.success({});
			} catch (e) {
				cbs.error(e);
			}
		}
	}
});
module.exports = MemoryAdapter; 