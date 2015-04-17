var domain = require('./index');
var express = require('express');
var path = require('path')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var Promise = require('promise');
app.use(cookieParser('your secret here'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(domain.express())



domain.service.register("$b", function($req, $res) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve({
				details: "This is async b"
			})
		}, 1)
	})

});

domain.service.register("$a", function($b) {
	return {
		data: $b.details
	}
});



var rootResource = domain.resources.BaseResource.extend({
	index: function($res, $a) {
		$res.send("Hello world " + $a.data)
	}
});
domain.add("/", rootResource);



var server = app.listen(3000, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});