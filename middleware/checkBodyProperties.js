module.exports = function (context, properties) {
    for (let i = 0; i < properties.length; i++) {
        if (!context.req.body.input.hasOwnProperty(properties[i])) {
            context.log("Property " + properties[i] + " doesnt exist");
            const errorJson = {
                message: "Property " + properties[i] + " doesnt exist",
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
    }
    context.next()
} 