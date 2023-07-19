var MiddlewareHandler = require('azure-middleware');
const checkBody = require('../middleware/checkBody');
const checkBodyProperties = require('../middleware/checkBodyProperties');
const catchError = require('../utils/catchError');
const handler = require('./handler');
const checkSecret = require('../middleware/checkSecret');

module.exports = new MiddlewareHandler()
    .use(checkSecret)
    .use(checkBody)
    .use((context) => {
        const props = ['client_id', 'identity_token'];;
        checkBodyProperties(context, props);
    })
    .use(handler)
    .catch(catchError)
    .listen();