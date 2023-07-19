var MiddlewareHandler = require('azure-middleware');
const checkBody = require('../middleware/checkBody');
const checkSecret = require('../middleware/checkSecret');
const checkBodyProperties = require('../middleware/checkBodyProperties');
const catchError = require('../utils/catchError');
const handler = require('./handler');

module.exports = new MiddlewareHandler()
    .use(checkSecret)
    .use(checkBody)
    .use(handler)
    .catch(catchError)
    .listen();