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

	var domain = require('wires-domain');
	domain.path("/:id?", domain.BaseResource.extend({
		index: function($res, $params) {
				$res.send({ id : $params.id } )
		}
	}));

All matched paramaters are combined into "$params" injection

## Services

### Synchronous

	domain.service("$a", function($b) {
	     return "a"
	});

### Asynchronous
        domain.service("$wait", function() {
		return domain.promise(function(resolve, reject) {
			setTimeout(function() {
				resolve({
				status: "Waiting is done"
				})
			}, 1000);
		})
	});

or you can use 

       new Promise(function(resolve, reject){})
       
It is equal


### Models

Wires supports automatic model creation.
Simply do that:

    domain.service("item", function() {
		return domain.Model.extend({
		    init : function($a)
		    {
		    	this.localVariable = $a;
		    },
		    testMe : function()
		    {
		    	return this.localVariable;
		    }
		});
	});

Accesing this service with constuct the model, call init, resolving all dependencies, (except for promise)

      	index: function($res, item) {
	  	$res.send(item.testMe())
	}

### Exceptions

Any exception can be thrown. If an object is a dictionary and it containes "status" key, that will be taken as a http code response. You can combine it with "message"

     domain.service("$a", function($params.id) {
		if ( $params.id === 5 ){
			throw {status : 400, message "You can't access this item"}
		}
	});


