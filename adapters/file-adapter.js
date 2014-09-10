var MemoryAdapter = require('./memory');
var _ = require('lodash');
var fs = require('fs');
var mkdirp = require('mkdirp');
var FileAdapter = MemoryAdapter.extend({
}, {
	wasFetched : {},
	folder : './db/',
	savetoFile : function(collection) {
		var collectionFile = this.folder + collection.name + ".json";
		fs.writeFileSync(collectionFile, JSON.stringify(this.collections[collection.name], undefined, 2));
	},
	_fetchMe : function(collection) {
		if (!this.wasFetched[collection.name]) {
			if (!fs.existsSync(this.folder)) {
				fs.mkdirSync(this.folder, 0766);
			}
			var collectionFile = this.folder + collection.name + ".json";
			if (!fs.existsSync(collectionFile)) {
				fs.writeFileSync(collectionFile, JSON.stringify(this.getCollection(collection.name)));
			}
			this.collections[collection.name] = JSON.parse(fs.readFileSync(collectionFile).toString());
			this.wasFetched[collection.name] = true;
		}
	},
	fetch : function(collection, opts, done) {
		this._fetchMe(collection);
		MemoryAdapter.fetch.apply(this, arguments);
	},
	insert : function(collection, values, done) {
		this._fetchMe(collection);
		MemoryAdapter.insert.apply(this, arguments);
		this.savetoFile(collection);
	},
	update : function(collection, id, values, done) {
		this._fetchMe(collection);
		MemoryAdapter.update.apply(this, arguments);
		this.savetoFile(collection);
	},
	remove : function(collection, id, done) {
		this._fetchMe(collection);
		MemoryAdapter.remove.apply(this, arguments);
		this.savetoFile(collection);
	}
});
module.exports = FileAdapter; 