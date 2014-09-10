var app = app || {};
(function() {
	'use strict';
	app.MainController = Wires.MVC.Controller.extend({
		essentials : {
			views : {
				'index' : 'main.html',
				'showEvents' : 'events.html',
			},
			collections : {
				items : app.ItemModel
			}
		},
		initialize : function() {
			
		},
		// Index ******************************
		index : function(params, render) {
			this.item = new app.ItemModel();
			this.item.setCollection(this.items);
			render();
		},
		showEvents : function(params, render) {
			this.item = this.items.findById(params.id);
			// Fetching
			this.item.fetchMany('events');
			
			this.event = new app.EventModel();
			
			//Setting app id
			this.event.item_id = this.item.id;
			// Setting collection to to add
			
			this.event.setCollection(this.item.events);
			
			render();
		}
	});
})();
