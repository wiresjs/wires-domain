wires-domain
============

Restful Model implementation

## About

The very simple rest implementation. Couple of lines and your rest server is ready,

All you need to do is:

* Create a model
* Set the adapter type (Memory, File, Mongo, Mysql )

P.S
Mongo, Mysql adapters are currently under development

## Installation

    npm install wires-domain

Create a simple model

    var Item = domain.models.BaseModel.extend({
     name : 'items'
    })

Configure your app.js

    var domain = require('wires-domain')
    
    domain.setAdapter( domain.adapters.File );
    rest.Collection.register('/items', {
        handler : resources.ModelResource,
        model   : domain.test.models.Item
    })

    app.use(rest.Service);
    
 Your rest service is ready! It'll save, list, update and remove records with a conventional REST requests



