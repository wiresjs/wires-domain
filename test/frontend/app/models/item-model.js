var app = app || {};
(function() {
    'use strict';
    app.ItemModel = Wires.Model.extend({
        _settings : {
            resource : '/api/items',
            schema : {
                id: {},
                name : {}
            },
            hasMany : { events : function(){ return app.EventModel; } }
        },
        validate : function()
        {
        	if ( !this.name ){
        		return {message : "Please, provide title"};
        	}
        }
        
    });
})();