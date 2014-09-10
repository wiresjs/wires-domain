var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');
var _ = require('lodash');
var Item = domain.models.BaseModel.extend({
	name : 'items_' + Math.random(),
});
describe('Test criteria', function() {
	domain.setAdapter(domain.adapters.Memory);
	var randomId, randomName;
	
	describe('Testing', function() {
		var initialData = ["ivan", "jose", "allan", "mike", "roger"];
		it("Prepare data", function(done) {
			for (var i in initialData) {
				var name = initialData[i];
				var record = new Item({
					name : name
				});
				record.save({
					success : function() {
					},
					error : function() {
					}
				});
			}
			done();
		});
		it("Should find user by name", function(done) {
			new Item().find({
				name : "mike"
			}).first({
				success : function(item) {
					item.should.be.not.null;
					item.attrs.name.should.be.equal('mike');
					done();
				}
			});
		});
	});
});
