module.exports = function (context) {
    if (!context.req.body.input) {
        context.log("Invalid json input");
        context.res = {
            body: {
                message: "Invalid json input"
            },
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        };

        return context.done();
    }
    context.next();
}