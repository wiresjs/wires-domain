var log4js = require('log4js');
var _ = require("lodash");

var NiceConfig = require('wires-config');
var express = require('express');
var bodyParser = require('body-parser');
var rest = require('./rest');
var domain = require('./index');
var cookieParser = require('cookie-parser');


exports.logger = log4js.getLogger("domain");
exports.adapters = require('./adapters');
exports.models = require('./models');
exports.resources = require('./resources');
exports.test = require('./test');
exports.errors = require('./errors');
exports.rest = require('./rest');
exports.auth = require('./auth');
exports.service = require('./service');


exports.app = null;

exports.webApp = function() {
	this.app = express();
	this.app.use(cookieParser('your secret here'));
	this.app.use(bodyParser.json());
	this.app.use(bodyParser.urlencoded({
		extended: true
	}));
	return this.app;
}

exports.add = function(path, opts) {
	rest.Path(path, opts)
}

exports.setup = function(adapter) {
	if (_.isString(adapter)) {
		switch (adapter) {
			case "file":
			case "tiny":
				adapter = exports.adapters.Tiny
				break;
			case "mongo":
			case "mongodb":
				adapter = exports.adapters.Mongodb
				break;
			case "mysql":
				adapter = exports.adapters.Mysql
				break;
			default:
				return exports.adapters.Tiny;
		}
	}

	this.adapters.setAdapter(adapter);
	return adapter;
};


exports.express = function() {
	return rest.Simple;
}
exports.connect = function(cfg, ready) {
	var self = this;
	if (!cfg) {
		console.error("No config defined");
	} else {
		this.config = cfg;
		if (this.app) {
			this.app.use(rest.Service);
		}

		var adapterType = cfg.get('domain.adapter.type', 'file');
		var adapterOpts = cfg.get('domain.adapter.opts', {});
		var setupRoot = cfg.get('domain.setupRootUser', false);

		var sync = adapterOpts.sync || [];
		if (sync) {
			sync.push(domain.auth.models);
		}
		domain.setup(adapterType).connect(adapterOpts, function(err) {
			if (err) {
				console.log(err);
			} else {
				if (setupRoot) {
					domain.auth.setup.rootCredentials();
				}
				ready ? ready() : null;
			}
		});
	}
}