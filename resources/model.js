var BaseResource = require('./base');
var _ = require('lodash');
var ModelResource = BaseResource.extend({
	initialize : function(modelClass) {
		this.modelClass = modelClass;
	},
	_createInstance : function(params) {
		return new this.modelClass(params);
	},
	index : function(env) {
		var res = env.res;
		var model = this._createInstance();
		var criteria = env.params.criteria;
		var self = this;
		
		model.find(criteria).order(env.params.order).limit(env.params.limit).all({
			success : function(result) {
				res.send(criteria.id ? result.length > 0 ? result[0] : {} : result);
			},
			error : function(e) {
				self.onError(res, e);
			}
		});
	},
	onError : function(res, e) {
		console.log(e.stack ? e.stack : e);
		res.status(e.code ? e.code : 500).send(e);
	},
	// new record
	add : function(env) {
		var req = env.req;
		var model = this._createInstance(req.body);
		var res = env.res;
		var self = this;
		model.save({
			success : function(result) {
				res.send(result);
			},
			error : function(e) {
				self.onError(res, e);
			}
		});
	},
	// update
	update : function(env) {
		var res = env.res;
		var criteria = env.params.criteria;
		var model = this._createInstance();
		if (!criteria.id) {
			res.send({
				error : 'Not implemented'
			}, 501);
			return;
		};
		var self = this;
		model.find(criteria).first({
			success : function(record) {
				if (record) {
					record.attachValues(env.req.body);
					record.save(function(result) {
						res.send(result);
					});
				} else {
					res.status(404).send('Not Found');
				}
			},
			error : function(e) {
				self.onError(res, e);
			}
		});
	},
	// remove
	remove : function(env) {
		var model = this._createInstance();
		var res = env.res;
		var criteria = env.params.criteria;
		var self = this;
		model.find(criteria).first({
			success : function(record) {
				if (record) {
					record.remove(function(r) {
						res.send(r);
					}, function(e) {
						self.onError(e);
					});
				} else {
					res.status(404).send('Not Found');
				}
			},
			error : function(e) {
				self.onError(res, e);
			}
		});
	}
});
module.exports = ModelResource;
