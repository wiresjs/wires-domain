var Class = require('wires-class');
var _ = require('lodash');
var adapters = require('../adapters');
var errors = require('../errors');
var async = require('async');
var BaseModel = Class.extend({
    name: 'test',
    initialize: function(attrs) {
        var self = this;
        this.parentClass = this.constructor;
        this.attrs = {};
        this.fetchOptions = {
            criteria: {},
            orderBy: [],
            limit: 0,
            offset: 0,
        };
        this.joins = [];
        this.adapter = adapters.getCurrent();
        this.attachValues(attrs);
    },
    get: function(attrName) {
        return this.attrs[attrName];
    },
    set: function(attrName, attrValue) {
        this.attrs[attrName] = attrValue;
    },
    // Checks callbacks and sets default callbacks
    // If needed
    _getCallbacks: function(cbs, error) {
        var callbacks = {
            success: function(e) {
                //console.log(e.stack ? e.stack : e);
            },
            error: function(e) {
                console.log(e.stack ? e.stack : e);
            }
        };
        if (_.isFunction(cbs)) {
            callbacks.success = cbs;
        } else if (_.isObject(cbs)) {
            if (_.isFunction(cbs.success)) {
                callbacks.success = cbs.success;
            }
            if (_.isFunction(cbs.error)) {
                callbacks.error = cbs.error;
            }
        }
        if (_.isFunction(error)) {
            callbacks.error = error;
        };
        return callbacks;
    },
    find: function(criteria) {
        if (criteria)
            this.fetchOptions.criteria = _.merge(this.fetchOptions.criteria, criteria);

        return this;
    },
    // Limit
    limit: function(number) {

        if (_.isNumber(number)) {
            this.fetchOptions.limit = number;
        }
        return this;
    },
    count: function() {
        var callbacks = this._getCallbacks.apply(this, arguments);
        this.adapter.count(this, this.fetchOptions, callbacks);

    },
    offset: function(number) {
        if (_.isNumber(number)) {
            this.fetchOptions.offset = number;
        }
        return this;
    },
    // Order
    // Accepts dictionary
    order: function(dict) {
        var self = this;
        if (_.isObject(dict)) {
            _.each(dict, function(direction, key) {
                self.orderBy(key, direction);
            });
        }
        return this;
    },
    // Order by key and direction
    // Can be asc or desc
    orderBy: function(key, direction) {
        this.fetchOptions.orderBy.push({
            key: key,
            direction: direction ? direction.toLowerCase() : 'asc'
        });
        return this;
    },

    with: function(model, condition) {
        this.joins.push({
            model: model,
            condition: condition || {}
        });
        return this;
    },
    _withCondition: function(models, condition, targetModel) {
        var res = _.mapValues(condition, function(value) {

            if (value !== undefined && value[0] === "$") {
                var key = value.substring(1, value.length);
                var k = key.split('.');
                var modelKey = k[0];
                if (k.length == 2) {
                    targetModel = k[0];
                    modelKey = k[1];
                }
                return models[targetModel].get(modelKey);
            }
            return value;
        });

        return res;
    },
    _fetchCorrespondingRelations: function(current, error, success) {
        var self = this;
        async.eachSeries(self.joins, function(item, callback) {
            // Create a condition
            var condition = self._withCondition({}, item.condition, self.name)
                // Request with model
            new item.model().find(condition).first(function(wm) {
                if (wm) {
                    current.set(item.model.prototype.name, wm);
                }
                callback();
            });
        }, function(err) {
            if (err) {
                error(err);
            } else {
                success(current);
            }
        });
    },
    first: function() {
        var self = this;

        var callbacks = this._getCallbacks.apply(this, arguments);


        this._fetch({
            success: function(results) {
                var fres = {}
                fres[self.name] = results.length > 0 ? self._createInstance(results[0]) : null;

                var skipTheRest = false;

                async.eachSeries(self.joins, function(item, callback) {
                    var r = _.last(_.values(fres));
                    if (!r || skipTheRest) {
                        callback();
                        skipTheRest = true;
                        return;
                    }
                    // Create a condition
                    var condition = self._withCondition(fres, item.condition, self.name)
                        // Request with model
                    new item.model().find(condition).first(function(wm) {
                        if (!wm) {
                            skipTheRest = true;
                            callback();
                            return;
                        }
                        fres[wm.name] = wm;
                        callback();
                    });
                }, function(err) {
                    if (err) {
                        callbacks.error(err);
                    } else {
                        callbacks.success.apply(self, _.values(fres));
                    }
                });
            },
            error: function(err) {
                callbacks.error(err);
            }
        });
    },
    // Convinience method
    asyncAll: function(callback, done) {
        this.all(function(items) {
            async.eachSeries(items, callback, done);
        });
    },
    all: function() {
        var self = this;
        var callbacks = this._getCallbacks.apply(this, arguments);

        this._fetch({
            success: function(results) {

                results = self._createInstance(results);
                if (self.joins.length > 0) {

                    async.eachSeries(results, function(item, callback) {
                        self._fetchCorrespondingRelations(item, function(err) {
                            callbacks.error(err);
                        }, function() {
                            callback();
                        })
                    }, function() {
                        callbacks.success(results);
                    });

                } else {
                    callbacks.success(results);
                }
            },
            error: function(error) {
                callbacks.error(error);
            }
        });
    },
    // Saving the model
    save: function() {
        var callbacks = this._getCallbacks.apply(this, arguments);
        try {
            if (this.attrs.id) {
                this._update(callbacks);
            } else {
                this._insert(callbacks);
            }
        } catch (e) {
            callbacks.error(e);
        }
    },
    remove: function() {
        var callbacks = this._getCallbacks.apply(this, arguments);
        if (this.attrs.id) {
            this.adapter.remove(this, this.attrs.id, callbacks);
        } else {
            callbacks.error({});
        }
    },
    attachValues: function(attrs) {
        var schema = this.schema;
        var self = this;
        _.each(attrs, function(value, key) {
            self.attrs[key] = value;
        });
    },
    validateAttributes: function(attrs, options) {
        var schema = this.schema;
        var self = this;
        if (schema) {
            var values = {};
            _.each(schema, function(params, name) {
                // check validation
                if (params.required) {
                    if (_.isFunction(params.required)) {
                        // Call validation function
                        var newValue = params.required.bind(self)(attrs[name]);
                        // SEtting new value
                        if (newValue !== undefined) {
                            attrs[name] = newValue;
                        }
                    }
                    if (_.isBoolean(params.required)) {
                        if (params.required === true && attrs[name] === undefined) {
                            throw new errors.Validate("Field " + name + " is required!");
                        }
                    }
                }
                if (attrs[name] !== undefined) {
                    values[name] = attrs[name];
                } else {
                    // Check for defaults
                    if (params.defaults) {
                        if (_.isFunction(params.defaults)) {
                            values[name] = params.defaults.bind(self)();
                        }
                    }
                }
            });
            return values;
        }
        return attrs;
    },
    // new instance
    _createInstance: function(v) {
        var self = this;
        if (_.isArray(v)) {
            var values = [];
            _.each(v, function(item) {
                values.push(new self.parentClass(item));
            });
            return values;
        }
        return new this.parentClass(v);
    },
    _fetch: function(cbs) {
        this.adapter.fetch(this, this.fetchOptions, cbs);
    },
    // Inserting new model
    _insert: function(cbs) {
        var self = this;
        var attrs = this.validateAttributes(this.attrs);
        this.adapter.insert(this, attrs, {
            success: function(r) {
                var newInstance = self._createInstance(r);
                cbs.success(newInstance);
            },
            error: function(error) {
                cbs.error(error);
            }
        });
    },
    // Updating models
    _update: function(cbs) {
        var self = this;
        var attrs = this.validateAttributes(this.attrs);
        this.adapter.update(this, this.attrs.id, this.attrs, {
            success: function(r) {
                cbs.success(self);
            },
            error: function(error) {
                cbs.error(error);
            }
        });
    },
    toJSON: function() {
        var schema = this.schema;
        var self = this;
        if (schema) {
            var values = {};
            var self = this;
            _.each(schema, function(params, name) {
                if (!params.hidden) {
                    values[name] = self.attrs[name];
                }
            })
            return values;
        }
        return this.attrs;
    }
});
module.exports = BaseModel;