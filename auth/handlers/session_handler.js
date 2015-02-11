var domain = require('../../index');
var crypto = require('crypto');
var _ = require('lodash');
var SessionHandler = domain.resources.BaseResource.extend({
	initialize : function(modelClass) {
		this.modelClass = domain.auth.models.DomainSession;
	},
	_createInstance : function(params) {
		return new this.modelClass(params);
	},
	index : function(env) {
		var res = env.res;
		if ( env.session ){
			res.send({ session : env.session, user : env.session.user, group : env.session.group});
		} else {
			res.send({}, 401);
		}
	},
	remove : function(env){
		var res = env.res;
		if ( env.session ){
			env.session.remove();
			res.send({ message : "Session removed"});
		} else {
			res.send({ message : "Session is not registered"});
		}
	},
	// Login functionality
	add : function(env) {
		var req = env.req;
		var res = env.res;
		var name = req.body.name;
		var self = this;
		var password = req.body.password ? crypto.createHash('md5').update(req.body.password).digest('hex') : null;
		if (!name || !password) {
			env.res.status(400).send({
				error : "Please, provide name and password!"
			});
			return;
		}


		var user = new domain.auth.models.DomainUser();
		
		// Checking user
		user.find({
			name : name,
			password : password
		}).first({
			success : function(model) {
				
				if (model) {
					var session = new domain.auth.models.DomainSession({
						user_id : model.get("id")
					});
					session.setRandomSession();
					session.save(function(sess) {
						res.cookie('session_id', session.get('session_id'));
						res.send(sess);
					});
				} else {
					env.res.status(400).send({
						error : "Can't seem to find user"
					});
				}
			}
		});
	}
});
module.exports = SessionHandler;
