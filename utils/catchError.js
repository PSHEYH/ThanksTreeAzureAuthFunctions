const catchError = (error, context, msg) => {
    context.log(error.message);
    context.res = {
        body: {
            message: "Server error"
        },
        headers: {
            'Content-Type': 'application/json'
        },
        status: 500
    }
    context.done();
}
module.exports = catchError;