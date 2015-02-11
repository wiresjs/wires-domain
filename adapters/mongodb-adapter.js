var index = require('../index');
var logger = index.logger;

var _ = require('lodash')
var mongo = null
var MongoClient = null;
var ObjectID = null;
var Connection = null;
var adapters = require('./index');
var createdIndexes = {};


// Fixing criterias
// Converting ids to _ids
// Fixing ObjectId for all keys that contain _id (item_id)
var fixMongoObjects = function(data, name) {
    var indexes = [];
    _.each(data, function(value, key) {
        if (key === "id") {
            if (_.isString(value)) {
                data["_id"] = new ObjectID(value);
            }
            delete data["id"];
        } else {
            if (key.indexOf("_id") > -1) {
                if (_.isString(value)) {
                    try {
                        data[key] = new ObjectID(value);
                    } catch (e) {}
                    if (name) {

                        if (!createdIndexes[name]) {
                            createdIndexes[name] = {};
                        }
                        if (!createdIndexes[name][key]) {
                            indexes.push(key);

                            createdIndexes[name][key] = true;
                        }
                    }

                }
            }
        }
    })
    return indexes;
}

var MongdoAdapter = adapters.Base.extend({

}, {
    fetch: function(collection, opts, cbs) {

        var collection = Connection.collection(collection.name);
        var criteria = opts.criteria || {};

        fixMongoObjects(criteria);


        var q = collection.find(criteria);
        // opts.criteria
        // opts.order
        // opts.group
        // opts.limit
        // opts.offset

        q.toArray(function(err, docs) {
            if (err) {
                cbs.error(err)
            } else {
                _.each(docs, function(item, index) {
                    var id = item._id;
                    delete item._id;
                    docs[index].id = id;
                })
                cbs.success(docs);
            }
        });

        return this;
    },
    insert: function(collection, values, cbs) {

        var collectionName = collection.name;
        var collection = Connection.collection(collection.name);
        var indexes = fixMongoObjects(values, collectionName);
        collection.insert(values, function(err, result) {
            if (err) {
                cbs.error(err)
            } else {
                if (result.length > 0) {
                    var doc = result[0]
                    var id = doc._id;
                    doc.id = id.toString();
                    cbs.success(doc);
                    _.each(indexes, function(indexName) {
                        var dict = {};
                        dict[indexName] = 1;
                        collection.ensureIndex(dict, function() {})
                    })
                }
            }
        });

        return {};
    },
    update: function(collection, id, values, cbs) {
        // Update document where a is 2, set b equal to 1
        var collection = Connection.collection(collection.name);
        fixMongoObjects(values);
        collection.update({
            _id: new ObjectID(id)
        }, {
            $set: values
        }, function(err, result) {
            if (err) {
                cbs.error(err)
            } else {
                cbs.success(result)
            }
        });

    },
    remove: function(collection, id, cbs) {
        var collectionName = collection.name;
        var collection = Connection.collection(collection.name);
        if (_.isString(id)) {
            id = new ObjectID(id);
        }
        collection.remove({
            _id: id
        }, function(err) {
            if (err) {
                cbs.error(err)
            } else {
                cbs.success({})
            }
        });
    },
    onSetup: function(options, callback) {
        logger.info("Using Mongodb adapter");

        try {
            mongo = require('mongodb');
            MongoClient = mongo.MongoClient;
            ObjectID = mongo.ObjectID;
        } catch(e){
            logger.fatal("Mongo package is not installed! npm install mongodb");
            return;
        }    

        var host = options.host || "localhost";
        var port = options.port || 27017;
        var db = options.db || "thetest"
        var url = "mongodb://" + host + ":" + port + "/" + db;
        logger.info("Connecting to: " + url);
        MongoClient.connect(url, function(err, db) {
            Connection = db;
            callback(err);
        });
    }
})

module.exports = MongdoAdapter;