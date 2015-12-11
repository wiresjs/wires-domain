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
	options: function($req, $res) {
		$res.header("Access-Control-Allow-Origin", "*");
		$res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	},
	get: function($res, $jsonp, $params) {
		$jsonp('callback');
		return $params;
	},
	post: function($res, $cors, $body) {
		$cors();
		return {
			ok: "RESULT IS HERE!"
		};
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
	get: function($res, $query, $nice, $next) {
		var date = $query.get("name@required,moment('DD-MM-YYYY')");
		var isPukka = $query.get("pukka@required,bool");

		return {
			date: date,
			isPukka: isPukka
		};
	}
});
