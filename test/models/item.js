var domain = require('../../index');
var Item = domain.models.BaseModel.extend({
	name : 'items',
	schema : {
		id : {},
		name : {
			required : function(name) {
				if (name === 'pukka') {
					throw new domain.errors.Validate('Stop doing this already!');
				}
			}
		},
		password : {
			hidden : true
		}
	}
});
module.exports = Item;
