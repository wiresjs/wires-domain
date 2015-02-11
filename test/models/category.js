var domain = require('../../index');
var Category = domain.models.BaseModel.extend({
    name: 'category',
    schema: {
        id: {},
        name: {},
        project_id : {}
    }
});
module.exports = Category;