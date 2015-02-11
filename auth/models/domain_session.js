var domain = require('../../index');
var crypto = require('crypto');
var DomainSession = domain.models.BaseModel.extend({
	name : 'domain_session',
	schema : {
		id : {},
		session_id : { type : 'varchar(50)'},
		user_id : { type : 'int'}
	},
	setRandomSession : function()
	{
		var hash = crypto.createHash('md5')
			.update(Math.random() + "_" + new Date().getTime()).digest('hex');
		this.attrs.session_id = hash;
	}
});
module.exports = DomainSession;
