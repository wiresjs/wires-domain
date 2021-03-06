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

domain.service("WiresAssertHandler", function() {
	return function(msg) {
		return {
			custom: true,
			msg: msg
		}
	}
});

domain.path("/update", {
	get: function($eTag) {
		return $eTag.generate('sys-blog-query');
	}
});
domain.path("/test:lang?", {
	eTag: function(req) {
		if (req._parsedUrl.query.indexOf("name") > -1) {
			return 'sys-blog-query'
		}
	},
	get: function($query, $assert) {
		console.log("calling shit")
		return {
			pukka: "sukka"
		}
	},
	post: function($res, $body, $nice, $next) {
		//var date = $query.get("name@required,moment('DD-MM-YYYY')");
		//var isPukka = $query.get("pukka@required,bool");
		var infoName = $body.get("info.name@min(5),max(10, 'Custom message')");

		return {

			infoName: infoName
		};
	}
});
