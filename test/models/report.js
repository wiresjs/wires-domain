var domain = require('../../index');
var Report = domain.models.BaseModel.extend({
    name: 'report',
    schema: {
        id: {},
        date: {
            defaults: function() {
                return new Date().getTime();
            },
            type: 'bigint'
        },
        test_id: {
            required: true, type : 'int'
        },
        stats: {'type' : 'json'}
    }
});
module.exports = Report;
