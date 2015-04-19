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


	index: function($res, $date, $auth) {
		$auth.validate();

		$res.send({
			data: $date
		})
	}
}));