var MiddlewareHandler = require('azure-middleware');
const checkBody = require('../middleware/checkBody');
const catchError = require('../utils/catchError');
const handler = require('./handler');
const checkSecret = require('../middleware/checkSecret');

module.exports = new MiddlewareHandler()
    .use(checkSecret)
    .use(checkBody)
    .use(handler)
    .catch(catchError)
    .listen();