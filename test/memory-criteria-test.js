var assert = require("assert");
var models = require('./index');
var domain = require('../index.js');
var should = require('should');
var _ = require('lodash');

var modelName = Math.random();
var Item = domain.models.BaseModel.extend({
    name: 'items_' + modelName
});
describe('Test criteria', function() {
    domain.setAdapter(domain.adapters.Memory);
    var randomId, randomName;

    describe('Testing', function() {
        var initialData = ["ivan", "jose", "allan", "mike", "roger"];
        it("Prepare data", function(done) {

            for (var i in initialData) {
                var name = initialData[i];

                var record = new Item({
                    name: name,

                });
                record.save({
                    success: function() {},
                    error: function() {}
                });
            }
            done();
        });
        it("Should find user by name", function(done) {
            new Item().find({
                name: "mike"
            }).first({
                success: function(item) {
                    item.should.be.not.null;
                    item.attrs.name.should.be.equal('mike');
                    done();
                }
            });
        });

        it("Prepare models with tags", function(done) {
            var record = new Item({
                name: "item1",
                tags: [1, 2, 3]
            });
            record.save();
            var record = new Item({
                name: "item2",
                tags: [2]
            });
            record.save()
            var record = new Item({
                name: "item3",
                tags: [3, 1]
            });
            record.save();

            var record = new Item({
                name: "item4",
                tags: [4, 1]
            });
            record.save();

            var record = new Item({
                name: "item5",
                tags: [5]
            });
            record.save();

            done();
        });

        it("Search for tags", function(done) {
            var tagsToBeFound = [4, 3];
            new Item().find({
                tags: {
                    $in: tagsToBeFound
                }
            }).all(function(result) {
                _.each(result, function(model) {
                    _.intersection(model.attrs.tags, tagsToBeFound).length.should.be.greaterThan(0);
                })
                done();
            })
        });
    });
});