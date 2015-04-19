var domain = require('../../index');
var Promise = require('promise');

domain.service("$wait", function() {
	return new Promise(function(resolve, reject) {

		setTimeout(function() {
			resolve({
				status: "Waiting is done"
			})
		}, 1);
	})
});