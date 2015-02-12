var index = require('../index');
var logger = index.logger;

var _ = require('lodash')
var Mosql = null;
var path = require("path");
var adapters = require('./index');



var MysqlAdapter = adapters.Base.extend({

}, {
    onSetup: function(options, callback) {
        
        logger.info("Using Mysql adapter");
        try {
        Mosql = require('wires-mysql');
        } catch(e){
            console.log(e);
            logger.fatal("wires-mysql is not installed!");
            logger.info("DO: npm install wires-mysql");
            
            return;
        }

        var options = options || {};

        var toSync = [];
        if (options.sync) {
            if (_.isArray(options.sync)) {
                _.each(options.sync, function(item) {
                    if (_.isPlainObject(item)) {
                        _.each(item, function(model, name) {
                            toSync.push({name : model.prototype.name, schema : model.prototype.schema});
                        })
                    }
                })
            }
            if (_.isPlainObject(options.sync)) {
                _.each(options.sync, function(model, name) {
                    toSync.push({name : model.prototype.name, schema : model.prototype.schema});
                })
            }

        }

        // Creating pool here
        Mosql.connection.createPool(options);

        if (!toSync.length) {
            callback(null);
        } else {
           var sync = new Mosql.schema.Sync(toSync);
            sync.start(function() {
                callback(null);
            })
        }
    },

    _getQuery: function(select, opts) {
        var opts = opts || {};

        var query = select.where(opts.criteria);

        if (opts.limit && query.limit) {
            query = query.limit(opts.limit);
        }
        if (opts.offset && query.offset) {
            query = query.offset(opts.offset);
        }
       
        if (opts.orderBy && query.order) {
            var o = {};
            _.each(opts.orderBy, function(i){
                o[i.key] = i.direction;
            });
            query.order(o);
        }
        return query;
    },
    count: function(collection, opts, cbs) {
        var select = Mosql.operations.Operation
            .provide(collection.name, "select", collection.schema);

        select = this._getQuery(select, opts);
        select.count()
            .request(function(err, res) {
                if (err) {
                    cbs.error(err);
                } else {
                    cbs.success(res);
                }
            });
        return this;
    },
    fetch: function(collection, opts, cbs) {
        var select = Mosql.operations.Operation
            .provide(collection.name, "select", collection.schema);

        select = this._getQuery(select, opts);

        select.request(function(err, res) {
            if (err) {
                cbs.error(err);
            } else {
                cbs.success(res);
            }
        });
        return this;
    },
    insert: function(collection, values, cbs) {
        var insert = Mosql.operations.Operation
            .provide(collection.name, "insert", collection.schema);

        insert.setData(values);

        insert.request(function(err, newid) {
            if (err) {
                cbs.error(err);
            } else {
                values.id = newid
                cbs.success(values);
            }
        });
        return {};
    },
    update: function(collection, id, values, cbs) {
        var update = Mosql.operations.Operation.provide(collection.name, "update", collection.schema);
        update.setData(values).where({
            id: id
        }).request(function(err) {
            if (err) {
                cbs.error(err);
            } else {
                cbs.success(values);
            }
        });
    },
    remove: function(collection, id, cbs) {
        var del = Mosql.operations.Operation.provide(collection.name, "delete", collection.schema);
        del.where({
            id: id
        }).request(function(err, info) {
            if (err) {
                cbs.error(err);
            } else {
                cbs.success(info);
            }
        });
    }
})

module.exports = MysqlAdapter;