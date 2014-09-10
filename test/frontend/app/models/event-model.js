var app = app || {};
(function() {
    'use strict';
    app.EventModel = Wires.Model.extend({
        _settings : {
            resource : '/api/events',
            schema : {
                id: {},
                name : {},
                item_id : {}
            },
        },
        validate : function()
        {
        	if ( !this.name ){
        		return {message : "Please, provide title"};
        	}
        }
        
    });
})();