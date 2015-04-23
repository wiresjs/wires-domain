var should = require('should')
var domain = require('../index.js')
var Class = require('wires-class')
var Promise = require("promise")



domain.service("$a", function() {
	return "Response from $a"
});

domain.service("$b", function($a) {
	return $a
});

domain.service("$c", function($a, $b) {
	return {
		a: $a,
		b: $b
	}
});

domain.service("$d", function($a) {
	return domain.promise(function(resolve, reject) {
		setTimeout(function() {
			resolve({
				some: $a
			});
		}, 50)
	});
});

domain.service("$e", function($local) {
	return $local;
});

domain.service("$someFactory", function() {
	return domain.Factory.extend({
		init: function() {},
		someMethod: function() {
			return "test";
		}
	});
});


domain.service("$asyncFactory", function() {
	return domain.Factory.extend({
		init: function() {
			var self = this;
			return domain.promise(function(resolve, reject) {
				setTimeout(function() {
					self.myVar = 1;
					resolve();
				}, 50);
			});
		},
		someMethod: function() {
			return "test";
		}
	});
});

var CustomClass = Class.extend({
	someMethod: function($a) {
		return $a;
	}
});



describe('Work flow', function() {

	it('Should simple call the service without dependencies', function(done) {
		domain.require(function($pukka) {
			$a.should.be.equal("Response from $a")
			done();
		}).then(function(res) {
			console.log("GOT SHIT")
		}).catch(function(e) {
			console.log("ErRORRS", e);
		})
	});

	it('Should call service with one dependency', function(done) {
		domain.require(function($b) {
			$b.should.be.equal("Response from $a")
			done();
		});
	});

	it('Should call service with 2 dependencies', function(done) {
		domain.require(function($c) {
			$c.a.should.be.equal("Response from $a")
			$c.b.should.be.equal("Response from $a")
			done();
		});
	});

	it('Should call service $d that is async', function(done) {
		domain.require(function($d) {
			$d.some.should.be.equal("Response from $a")
			done();
		});
	});

	it('Should Pass local argument with 2 arguments', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello")
			done();
		}, {
			$local: "hello"
		});
	});

	it('Should Pass fail without local argument and completion handler only', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello")

		}, function(err, results) {
			err.code.should.be.equal(400)
			done();
		});
	});

	it('Should Pass local argument with 3 arguments and return result', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello");
			return "some"
		}, {
			$local: "hello"
		}, function(err, res) {
			res.should.be.equal("some");
			done();
		});
	});

	it('Should Pass local argument with 3 arguments and return result asynchronously', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello");
			return domain.promise(function(resolve, reject) {
				setTimeout(function() {
					resolve("some");
				}, 1)
			})
		}, {
			$local: "hello"
		}, function(err, res) {
			res.should.be.equal("some");
			done();
		});
	});

	it('Should Call and Create Sync factory', function(done) {
		domain.require(function($someFactory) {
			$someFactory.someMethod().should.be.equal("test")
		}, function(err, results) {
			if (!err) {
				done();
			}
		});
	});

	it('Should Call and Create Async factory', function(done) {
		domain.require(function($asyncFactory) {
			$asyncFactory.myVar.should.be.equal(1)
		}, function(err, results) {
			if (!err) {
				done();
			}
		});
	});

	it('Should Call custom service method with injected dependencies ', function(done) {
		var my = new CustomClass();
		var methodName = "someMethod"

		var opts = {
			source: CustomClass.prototype[methodName],
			target: my[methodName],
			instance: my
		}
		domain.require(opts, function(err, results) {
			results.should.be.equal("Response from $a")
			if (!err) {
				done();
			}
		});
	});
});