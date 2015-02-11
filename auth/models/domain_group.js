var domain = require('../../index');
var DomainGroup = domain.models.BaseModel.extend({
	name : 'domain_group',
	schema : {
		id : {},
		name : {},
		permissions : { type : 'json' }
	}
});
module.exports = DomainGroup;
