var domain = require('../index');


domain.path("/:action?", {
	get : function($res, $query, $assert){

		$query.require('id', 'name')

		
		//$assert.notfound('THis bloody shit was not found')
		return domain.promise(function(resolve){

			resolve($query.items)
		});
	},
	pukka : function($res, $next){
		$res.send({hello : "from pukka"})

	}
});
/*domain.path("/", domain.BaseResource.extend({
	index: function($res, $nice, $next) {
		$next();
		//$res.send("First")
	}
}));

domain.path("/", domain.BaseResource.extend({
	index: function($res) {
		return {}
	}
}));*/