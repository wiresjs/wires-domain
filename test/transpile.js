var should = require('should');
var Transpile = require('../src/transpile.js');
var Class = require('wires-class');
var Promise = require("promise");
var fs = require('fs')

var readCase = function(num) {
   return fs.readFileSync(__dirname + "/test_transpiler/case_" + num + ".js").toString()
}
var cases = {
   a: readCase("a")
}
describe('Should transpile', function() {

   it("Should transpile", function() {
      var output = Transpile.str(cases.a);
      output.should.match(
         /domain.module\("helpers.DateHelper",\["TestModule", "wires.controllers.MainController", "wires.controllers.OtherController"\], function\(TestModule, MainController, OtherController\)\{/
      )
   });
});
