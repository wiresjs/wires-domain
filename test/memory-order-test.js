var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');
var _ = require('lodash');
var Item = domain.models.BaseModel.extend({
	name : 'items_' + Math.random(),
	schema : {
		id : {},
		name : {}
	}
});
describe('Test order', function() {
	domain.setAdapter(domain.adapters.Memory);
	describe('Crud', function() {
		var initialData = ["ivan", "jose", "allan", "mike", "roger"];
		it("Prepare data", function(done) {
			for (var i in initialData) {
				var name = initialData[i];
				var record = new Item({
					name : name
				});
				record.save({
					success : function(e) {
						
					},
					error : function() {
					}
				});
			}
			done();
		});
		it("Should sort ASC", function(done) {
			var ascendingOrder = _.sortBy(initialData, function(item) {
				return item.charCodeAt() * 1;
			});
			new Item().find().orderBy('name', 'asc').all({
				success : function(data) {
					_.each(data, function(item, index) {
						ascendingOrder[index].should.be.equal(item.attrs.name);
					});
					done();
				},
				error : function(e) {
					throw e;
				}
			});
		});
		it("Should sort DESC", function(done) {
			var descendingOrder = _.sortBy(initialData, function(item) {
				return item.charCodeAt() * -1;
			});
			new Item().find().orderBy('name', 'desc').all({
				success : function(data) {
					_.each(data, function(item, index) {
						descendingOrder[index].should.be.equal(item.attrs.name);
					});
					done();
				},
				error : function(e) {
					throw e;
				}
			});
		});
	});
});
