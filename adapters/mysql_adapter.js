var BaseAdapter = require('./base');
var _ = require('lodash');
var MysqlAdapater = BaseAdapter.extend({

}, {
	connect : function(properties) {
	/*	this.pool = mysql.createPool({
			host : "localhost",
			user : "root",
			password : "",
			database : "pukka"
		});*/
	},
	executeQuery : function(query, cbs) {
		/*var self = this;
		try {
			sync.fiber(function(cb) {
				var connection = sync.await(self.pool.getConnection(sync.defer()))
				try {
					var res = sync.await(connection.query(query, sync.defer()));
					cbs.success(res, connection);
				} catch (e) {
					cbs.error(e);
				}
				connection.release();
			});
		} catch (e) {
			cbs.error(e);
		}*/
	},
	fetch : function(collection, opts, cbs) {

		
		// this.executeQuery()
	},
	insert : function(collection, values, done) {

	},
	update : function(collection, id, values, done) {

	},
	remove : function(collection, id, done) {

	}
});
module.exports = MysqlAdapater;