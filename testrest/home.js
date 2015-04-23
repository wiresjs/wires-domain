var domain = require('../index');
/**
 * Home Resource
 * @param {[type]} $res [description]
 * @param {[type]} $params [description]
 * @param {[type]} $a [description]
 * @param {[type]} $b) {		$res.send($params)	}}) [description]
 * @return {[type]}
 */
domain.path("/", domain.BaseResource.extend({


	index: function($res, $nice) {

		//var item = new Item();
		console.log("FINALLY EXEC>>>>>>>>>>>>>>>>>>>>>", $nice);

		$res.send($nice)
	}
}));