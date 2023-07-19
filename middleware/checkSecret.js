module.exports = function (context) {
    if(!context.req.headers.hasOwnProperty('webhook-secret')){
        const errorJson = {
            message: "Forbidden",
            code: "403"
        }
        context.res = {
            body: errorJson,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 403
        };

        return context.done();
    }
    else if(context.req.headers['webhook-secret'] !== process.env.WEBHOOK_SECRET){
        const errorJson = {
            message: "Invalid webhook secret ",
            code: "400"
        }
        context.res = {
            body: errorJson,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        };

        return context.done();
    }
    context.next()
} 