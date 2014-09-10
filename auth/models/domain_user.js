var domain = require('../../index');
var crypto = require('crypto');

var DomainUser = domain.models.BaseModel.extend({
	name : 'domain_user',
	schema : {
		id : {},
		name : {},
		domain_group_id : {
			required : true
		},
		password : {
			required : function(password) {
				return crypto.createHash('md5').update(password).digest('hex');
			}
		}
	}
});
module.exports = DomainUser;
