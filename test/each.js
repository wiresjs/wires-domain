var should = require('should')
var domain = require('../index.js')
var Class = require('wires-class')
var Promise = require("promise")



describe('Testing promise each', function() {

	it('Should iterate each with promises', function(done) {
		var data = ["pukka", "sukka", "kukka"]

		domain.each(data, function(value) {
			return new Promise(function(resolve, reject) {
				resolve(value);
			});
		}).then(function(response) {
			should.deepEqual(data, response)
			done();
		}).catch(function(e) {
			console.log(e);
		});
	});


});