var index = require('../index');
var logger = index.logger;

var models = require('./models');
var crypto = require('crypto');

var Setup = {

    _getGroup: function(callback) {
        var group = new models.DomainGroup().find({
            name: "root"
        }).first(function(rootGroup) {
            // Create new group
            if (!rootGroup) {
                rootGroup = new models.DomainGroup({
                    name: "root",
                    permissions: {
                        root: true
                    }
                });
                rootGroup.save(function(group) {
                    callback(group);
                })
            } else {
                callback(rootGroup);
            }
        });
    },
    _getUser: function(data, callback) {

        new models.DomainUser().find({
            name: data.user,
            password: crypto.createHash('md5').update(data.password).digest('hex')
        }).first(function(rootUser) {
            // Create new group
            if (!rootUser) {
                rootUser = new models.DomainUser({
                    name: "root",
                    password: "123",
                    domain_group_id: data.group.get("id")
                });
                rootUser.save(function(user) {
                    callback(user);
                })
            } else {
                callback(rootUser);
            }
        });
    },
    rootCredentials: function(name, password, callback) {
        logger.info("Validate root credentials");
        var self = this;
        var name = name || "root";
        var password = password || "123";
        this._getGroup(function(group) {
            self._getUser({
                user: name,
                password: password,
                group: group
            }, function(user) {
                logger.info("Root credentials are fine now. Use "+name+"/"+password);
                logger.warn("Be sure to remove credentials setup for production");
                callback ? callback(user, group) : null;
            })
        })
    }
}


module.exports = Setup;