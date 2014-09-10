var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');

var _ = require('lodash');
var Item = domain.models.BaseModel.extend({
	name : 'items_' + Math.random(),
	schema : {
		id : {},
		name : {
			required : true
		}
	}
});

var Item2 = domain.models.BaseModel.extend({
	name : 'items_' + Math.random(),
	schema : {
		id : {},
		name : {
			required : function(v){
				if (v !== 'test' ){
					throw new domain.errors.Validate('Value test should be equal to "test"');
				}
				return v + "1";
			}
		}
	}
});
describe('Required test', function() {
	domain.setAdapter(domain.adapters.Memory);
	it("Should save and ignore fields that are not in schema", function(done) {
		new Item({
			name : "Test",
			sukka : "Pukka"
		}).save(function(e){
			e.attrs.should.not.have.property("sukka");
			done();
		});
	});
	
	it("Should validate with bool param", function(done){
		new Item({
			sukka : "Pukka"
		}).save(function(e){
		}, function(e){
			e.message.should.be.equal('Field name is required!');
			done();
		});
	});
	
	it("Should validate throw a function", function(done){
		new Item2({
			sukka : "Pukka"
		}).save(function(e){
		}, function(e){
			e.message.should.be.equal('Value test should be equal to "test"');
			done();
		});
	});
	
	it("Should modify value if it's okay", function(done){
		new Item2({
			name : "test"
		}).save(function(e){
			e.attrs.name.should.be.equal("test1");
			done();
		}, function(e){
			throw e;
		});
	});
});
