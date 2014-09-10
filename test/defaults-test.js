var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');

var _ = require('lodash');
var Item = domain.models.BaseModel.extend({
	name : 'items_' + Math.random(),
	schema : {
		id : {},
		slug : {},
		name : {
			defaults : function(){
				return this.attrs.slug + " hello";
			}
		}
	}
});

describe('Default values', function() {
	domain.setAdapter(domain.adapters.Memory);
	it("Should set default value for name", function(done) {
		new Item({
			slug : "test slug"
		}).save(function(e){
			e.attrs.name.should.be.equal('test slug hello');
			done();
		}, function(e){ throw e;});
	});
});
