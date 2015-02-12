var BaseResource = require('./base');
var _ = require('lodash');
var ModelResource = BaseResource.extend({
    initialize: function(modelClass) {
        this.modelClass = modelClass;
    },
    _createInstance: function(params) {
        return new this.modelClass(params);
    },
    // Creates and instance of model 
    // Sets all available properties
    // e.g critereas, orders and other
    // 
    _defineProperties : function(env)
    {
    	this.model = this._createInstance();
        this.criteria = env.params.criteria;

        
        // Query from request
        this.query = env.req.query;
        this.paginate = this.query.paginate || false;
        // Getting limits and offsets
        // Values could be passed from a filter, or (by default) can be taken from the query
        this.limit = (env.params.limit || this.query.limit ? this.query.limit * 1 : 0) || 0;
        this.offset = (env.params.offset || this.query.offset ? this.query.offset * 1 : 0) || 0;
        this.prepareFunction = env.params.prepare;
        this.order = env.params.order;
    },
    // Makes request, based on defined conditions
    // First function to be called: _defineProperties
    _basicFind: function(env, success) {
        var self = this;
        if ( this.prepareFunction ){
            this.model = this.prepareFunction(env, this.model);
        }
        this.model.find(this.criteria).order(this.order).limit(this.limit).offset(this.offset).all({
            success: success,
            error: function(e) {

                self.onError(env.res, e);
            }
        });
    },
    index: function(env) {
        var res = env.res;

        var self = this;
        this._defineProperties(env);

        // Paginate means, that we need to change the output view
        // Include counts offsets and limits
        if (this.paginate) {

            var initialModel = this._createInstance();
            initialModel.find(this.criteria).order(this.order).count({
                success: function(count) {
                    self._basicFind(env, function(result) {
                        res.send(self.criteria.id ? result.length > 0 ? result[0] : {} : {
                            count: count,
                            limit: self.limit,
                            offset: self.offset,
                            data: result
                        });
                    })
                },
                error: function(e) {

                    self.onError(res, e);
                }
            });
        } else {
            self._basicFind(env, function(result) {
                res.send(self.criteria.id ? result.length > 0 ? result[0] : {} : result);
            });
        }
    },

    onError: function(res, e) {
        
        console.log(e.stack ? e.stack : e);

        res.status(e.code ? e.code : 500).send(e);
    },
    // new record
    add: function(env) {
        var req = env.req;
        var model = this._createInstance(req.body);
        var res = env.res;
        var self = this;
        model.save({
            success: function(result) {
                res.send(result);
            },
            error: function(e) {
                self.onError(res, e);
            }
        });
    },
    // update
    update: function(env) {
        var res = env.res;
        var criteria = env.params.criteria;
        var model = this._createInstance();
        if (!criteria.id) {
            res.send({
                error: 'Not implemented'
            }, 501);
            return;
        };
        var self = this;
        model.find(criteria).first({
            success: function(record) {
                if (record) {
                    record.attachValues(env.req.body);
                    record.save(function(result) {
                        res.send(result);
                    });
                } else {
                    res.status(404).send('Not Found');
                }
            },
            error: function(e) {
                self.onError(res, e);
            }
        });
    },
    // remove
    remove: function(env) {
        var model = this._createInstance();
        var res = env.res;
        var criteria = env.params.criteria;
        var self = this;
        model.find(criteria).first({
            success: function(record) {
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
            error: function(e) {
                self.onError(res, e);
            }
        });
    }
});
module.exports = ModelResource;