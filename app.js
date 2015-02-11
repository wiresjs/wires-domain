var domain = require('./index');
var express = require('express');
var path = require('path')
var Config = require('wires-config');


var cfg = new Config({domain : domain});
cfg.load('app.conf')


var app = domain.webApp();

app.use('/test', express.static(path.join(__dirname, 'test/frontend')));


domain.add('/api/items/:id?', {
    model: domain.test.models.Item
});


domain.add('/api/items/:item_id/events/:id?', domain.test.models.Event);
domain.add('/api/events/:id?', domain.test.models.Event);


// user sessions
domain.add('/api/session', {
    handler: domain.auth.handlers.SessionHandler
});

domain.add('/api/users', {
    model: domain.auth.models.DomainUser,
    permissions: {}
});

domain.add('/api/groups', domain.auth.models.DomainGroup);

domain.connect(cfg, function() {
    var port = cfg.get('app.port', 8888);
    app.listen(port);
    console.log('listening on port:' + port);
});