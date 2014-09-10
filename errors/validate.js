var Exception = require('./exception');
var Validate = Exception.extend({
	initialize : function(message) {
		Validate.__super__.initialize.apply(this, [ message ? message : 'Validate error', 400]);
	}
});
module.exports = Validate;
