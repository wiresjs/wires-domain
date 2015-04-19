wires-domain
============

Restful Service for express.js with dependency injection.

## Installation

	npm install wires-domain --save


## Architecture

2 folders to be created. Services and RestApi. Put all your dependencies into "services" folder.
Resembles angular.js style.

Require all at once:

		require('require-all')('/services');
		require('require-all')('/rest');

Connect with express.js

		app.use(domain.express());


## Restfull example

		var domain = require('../index');
		domain.path("/:id?", domain.BaseResource.extend({
			index: function($res, $params) {
				$res.send({ id : $params.id } )
			}
		}));

All matched paramaters are combined into "$params" injection



