var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');
describe('Test Memory adapter crud', function() {
	domain.adapters.File.folder = './test/db/';
	domain.setAdapter(domain.adapters.Memory);
	describe('Crud', function() {
		var item = new domain.test.models.Item();
		it("Should fetch and return none", function(done) {
			item.find().all({
				success : function(result) {
					result.length.should.be.greaterThan(-1);
					done();
				},
				error : function(e) {
					throw e;
				}
			});
		});
		it("Should create new record", function(done) {
			item = new domain.test.models.Item({
				name : "Hello test"
			});
			item.save({
				success : function(model) {
					model.attrs.id.should.be.greaterThan(0);
					model.attrs.name.should.be.equal("Hello test");
					item = model;
					done();
				},
				error : function(e) {
					throw e;
				}
			});
		});
		it('Should update model', function(done) {
			item.attrs.name = "ivan";
			item.save({
				success : function(result) {
					result.attrs.name.should.be.equal("ivan");
					item.attrs.id.should.be.equal(result.attrs.id);
					done();
				},
				error : function(e) {
					throw e;
				}
			});
		});
	});
}); 