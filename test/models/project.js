var domain = require('../../index');
var Project = domain.models.BaseModel.extend({
    name: 'project',
    schema: {
        id: {},
        name: {},
    }
});
module.exports = Project;