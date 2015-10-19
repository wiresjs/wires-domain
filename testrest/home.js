var domain = require('../index');
var Promise = require("promise");
domain.service("$a", function() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve({
				test: "myasynce"
			});
		}, 500);
	});

});

domain.path("/hello/:id", {
	get: function($res, $jsonp, $params) {
		$jsonp('callback');
		return $params;
	},
	post: function($res, $body) {
		$res.send($body.attrs);
	}
});
//
// domain.path("/", {
// 	get: function($res, $query, $auth, $assert) {
// 		$auth.validate();
// 		i++;
// 		//$query.require('id', 'name')
// 		return $query.attrs;
// 	},
// 	pukka: function($res, $next) {
// 		$res.send({
// 			hello: "from test"
// 		})
// 	}
// });
domain.path("/", {
	get: function($res, $nice, $next) {
		$next();
		//$res.send("First");
	}
});

domain.path("/", {
	get: function($res) {
		return "Second";
	}
});
