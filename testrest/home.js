var domain = require('../index');

domain.path("/", domain.BaseResource.extend({
	index: function($res, $nice, $next) {
		$next();
		/*$res.send({
			intercept: true
		})*/
	}
}));

domain.path("/", domain.BaseResource.extend({


	index: function($res, $nice, $next) {


		$res.send($nice)
	}
}));