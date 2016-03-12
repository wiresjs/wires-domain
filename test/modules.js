var should = require('should');
var domain = require('../index.js');
var Class = require('wires-class');
var Promise = require("promise");
domain.service("$serviceSome", function() {
   return {
      data: new Date()
   }
});
domain.module("$moduleA", function($serviceSome) {
   console.log("Execute module a", $serviceSome);
   return Math.random();
});

domain.module("$moduleB", function() {
   return 1;
});

describe('Modules should be cached', function() {

   var randomNumber;
   it('Should give a random number', function(done) {
      domain.require(function($moduleA) {
         randomNumber = $moduleA;
         randomNumber.should.be.greaterThan(0)

         done();
      }).catch(done)
   });

   it('Require is second time should give the same number', function(done) {
      domain.require(function($moduleA) {

         randomNumber.should.equal($moduleA);

         done();
      }).catch(done)
   });

});
