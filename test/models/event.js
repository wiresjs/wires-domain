var domain = require('../../index');
var Event = domain.models.BaseModel.extend({
	name : 'events',
	schema : {
		id : {},
		name : {},
		item_id : {}
	}
});
module.exports = Event;
