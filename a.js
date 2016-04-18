var domain = require(__dirname + "/src/wires-domain.js").domain;

var a = [0, 1];

domain.each(a, function(item) {
   console.log(item);
}).catch(function(e) {
   console.log(e.stack)
})
