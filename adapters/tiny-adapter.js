var index = require('../index');
var logger = index.logger;

var _ = require('lodash')
var Tiny = require('./tiny/tiny.js');
var path = require("path");
var appRoot = require('app-root-path');
var md5 = require('MD5');
var mkdirp = require('mkdirp');
var adapters = require('./index');



var destinationPath = null;

var getDBPath = function(name) {
    if (destinationPath === null) {
        throw {
            message: "TINYDB Database is not connected. Use connect method before doing operations with database"
        }
    }
    return path.join(destinationPath, name);
}


var getNextId = function(name, cb) {
    Tiny(getDBPath("_ids_"), function(err, db) {
        db.get(name, function(err, data) {
            var id = 1;
            if (!data) {
                db.set(name, {
                    id: id
                }, function() {
                    cb(id);
                })
            } else {
                id = data.id;
                id++

                db.update(name, {
                    id: id
                }, function() {
                    cb(id);
                })
            }
        })
    })
}
var TinyAdapter = adapters.Base.extend({

}, {
    onSetup: function(options, callback) {
        logger.info("Using TinyDB adapter");
        var homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        this.dbRoot = options.database ? path.join(homeFolder, '.cache', options.database) : path.join(homeFolder, '.cache', 'tiny', md5(appRoot.path))
        destinationPath = this.dbRoot;
        mkdirp.sync(this.dbRoot);
        logger.info("DB Path: " + this.dbRoot);
        callback(null);
    },
    _getQuery: function(db, opts) {

        var query = db.find(opts.criteria);
     
        if (opts.limit) {
            query = query.limit(opts.limit);
        }

        if (opts.offset) {
            query = query.skip(opts.offset);
        }

        if (opts.order) {
            if (opts.direction == "asc") {
                query = query.asc(opts.order.key);
            } else {
                query = query.desc(opts.order.key);
            }
        }
        return query;
    },
    count: function(collection, opts, cbs) {
        var collectionPath;
        try {
            collectionPath = getDBPath(collection.name);
        } catch (e) {

            cbs.error(e);
            return;
        }

        var self = this;
        Tiny(collectionPath, function(err, db) {

            var query = self._getQuery(db, opts);
            query(function(err, results) {
                if (err) {
                    cbs.error(err);
                } else {
                    cbs.success(results.length);
                }
            })
        });
    },
    fetch: function(collection, opts, cbs) {

        var collectionPath;
        try {
            collectionPath = getDBPath(collection.name);

        } catch (e) {

            cbs.error(e);
            return;
        }
        var self = this;
        Tiny(collectionPath, function(err, db) {

                var query = self._getQuery(db, opts);

                query(function(err, results) {
                    if (err) {
                        cbs.error(err);
                    } else {
                        cbs.success(results);
                    }
                })

            })
            // opts.criteria
            // opts.order
            // opts.group
            // opts.limit
            // opts.offset
        return this;
    },
    insert: function(collection, values, cbs) {

        var collectionPath;
        try {
            collectionPath = getDBPath(collection.name);
        } catch (e) {
            cbs.error(e);
            return;
        }
        Tiny(collectionPath, function(err, db) {
            getNextId(collection.name, function(id) {
                values.id = id;
                db.set(id.toString(), values, function(error) {
                    if (error) {
                        cbs.error(error);
                    } else {
                        cbs.success(values);
                    }
                })
            });
        })
        return {};
    },
    update: function(collection, id, values, cbs) {
        var collectionPath;
        try {
            collectionPath = getDBPath(collection.name);
        } catch (e) {
            cbs.error(e);
            return;
        }
        Tiny(collectionPath, function(err, db) {

            db.update(id.toString(), values, function(error) {
                if (error) {
                    cbs.error(error);
                } else {
                    cbs.success(values);
                }
            })

        })
    },
    remove: function(collection, id, cbs) {
        var collectionPath;
        try {
            collectionPath = getDBPath(collection.name);
        } catch (e) {
            cbs.error(e);
            return;
        }
        Tiny(collectionPath, function(err, db) {

            db.remove(id.toString(), function(error) {
                if (error) {
                    cbs.error(error);
                } else {
                    cbs.success();
                }
            })

        })

    }
})

module.exports = TinyAdapter;