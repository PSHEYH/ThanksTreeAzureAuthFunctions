var MiddlewareHandler = require('azure-middleware');
const checkBody = require('../middleware/checkBody');
const checkBodyProperties = require('../middleware/checkBodyProperties');
const catchError = require('../utils/catchError');
const handler = require('./handler');

module.exports = new MiddlewareHandler()
    .use(checkBody)
    .use((context) => {
        const props = ['refresh_token'];
        checkBodyProperties(context, props);
    })
    .use(handler)
    .catch(catchError)
    .listen();