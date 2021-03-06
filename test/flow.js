var should = require('should');
var domain = require('../src/wires-domain.js').domain;
var Class = require('wires-class');
var Promise = require("promise");

domain.service("ns.serviceA", function() {
	return 1;
});
domain.service("ns.serviceB", function() {
	return 2;
});

domain.service("$a", function() {
	return "Response from $a";
});

domain.service("$stringVarService", ["$a"], function($a) {
	return $a;
});

domain.service("$b", function($a) {
	return $a;
});

domain.service("$c", function($a, $b) {
	return {
		a: $a,
		b: $b
	};
});

domain.service("$d", function($a) {
	return domain.promise(function(resolve, reject) {
		setTimeout(function() {
			resolve({
				some: $a
			});
		}, 50);
	});
});

domain.service("$e", function($local) {

	return $local;
});

domain.service("$someFactory", function() {

	return domain.Factory.extend({
		init: function($a) {

		},
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
		domain.require(function($a) {
			$a.should.be.equal("Response from $a");
		}).catch(function(error) {
			console.log(error);
		}).then(function() {
			done();
		});
	});

	it('Should require one from string', function(done) {
		domain.require('$a', function($a) {
			$a.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should require couple from string', function(done) {
		domain.require(['$a', '$c'], function($a, $c) {
			$a.should.be.equal("Response from $a");
			$c.a.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should call service with one dependency', function(done) {
		domain.require(function($b) {
			$b.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should should require service with string arguments defined', function(done) {
		domain.require(function($stringVarService) {
			$stringVarService.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should call service with 2 dependencies', function(done) {
		domain.require(function($c) {
			$c.a.should.be.equal("Response from $a");
			$c.b.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should call service $d that is async', function(done) {
		domain.require(function($d) {
			$d.some.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should Pass local argument with 2 arguments', function(done) {
		domain.require(function($e) {
			console.log($e);
			$e.should.be.equal("hello");
			done();
		}, {
			$local: "hello"
		}).catch(done);
	});

	it('Should fail without local argument', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello");

		}).then(function() {
			done("Should not come here");
		}).catch(function(err) {
			console.log(err)
			err.status.should.be.equal(500);
			done();
		});
	});

	it('Should Pass local argument with 3 arguments and return result', function(done) {
		domain.require(function($e) {
			$e.should.be.equal("hello");
			return "some";
		}, {
			$local: "hello"
		}).then(function(res) {
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
				}, 1);
			});
		}, {
			$local: "hello"
		}).then(function(res) {
			res.should.be.equal("some");
			done();
		});
	});

	it('Should Call custom service method with injected dependencies ', function(done) {
		var my = new CustomClass();
		var methodName = "someMethod";

		var opts = {
			source: CustomClass.prototype[methodName],
			target: my[methodName],
			instance: my
		};
		domain.require(opts).then(function(results) {
			results.should.be.equal("Response from $a");
			done();
		});
	});

	it('Should require by a string name', function(done) {
		domain.require("$a", function(injectedVar) {
			injectedVar.should.be.equal("Response from $a");
		}).then(function() {
			done();
		});
	});

	it('Should require package', function(done) {

		domain.requirePackage("ns").then(function(data) {
			data['ns.serviceA'].should.equal(1);
			data['ns.serviceB'].should.equal(2);
			done();
		});
	});
});
