var express = require('express');
var bodyParser = require('body-parser');
var resources = require('./resources');
var rest = require('./rest');
var path = require('path');
var domain = require('./index');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser('your secret here'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use('/test', express.static(path.join(__dirname, 'test/frontend')));
domain.setAdapter(domain.adapters.File);


rest.Path('/api/items/:id?', {
	model : domain.test.models.Item,
	permissions : {
		items : []
	}
});


rest.Path('/api/items/:item_id/events/:id?', domain.test.models.Event);
rest.Path('/api/events/:id?', domain.test.models.Event);
// Gets session
rest.Path('/api/session', {
	handler : domain.auth.handlers.SessionHandler
});
rest.Path('/api/users', domain.auth.models.DomainUser);
rest.Path('/api/groups', domain.auth.models.DomainGroup);
app.use(rest.Service);
app.listen(8888);
console.log('listening on port:8888');
