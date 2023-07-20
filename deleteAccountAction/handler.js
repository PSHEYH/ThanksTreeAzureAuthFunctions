const sendHasuraRequest = require("../utils/sendHasuraRequest");
const catchAsync = require("../utils/catchAsync");
const { default: axios } = require("axios");


module.exports = catchAsync(async function (context) {

    const deleteAccount = `mutation DeleteAccount($id: uuid!) {
        delete_users(where: {id: {_eq: $id}}){
          affected_rows
        }
      }`;

    const variables = {
        id: context.req.body.session_variables['x-hasura-user-id'],
    };

    const json = await sendHasuraRequest(deleteAccount, variables, context);
    if (json.data.delete_users.affected_rows == 0) {
        const errorJson = {
            message: "User not found",
            code: "404"
        };
        context.res = {
            body: errorJson,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        };
        return context.done();
    }
    const token = context.req.headers.authorization.split(' ')[1];
    //// Deleting all backup
    await axios.delete(process.env.STORAGE_URL + '/trees/myTree', {
        headers: {
            'Authorization': 'Bearer '+ token
        }
    });

    const result = {
        status: "success"
    };

    context.res = {
        body: result,
        headers: {
            'Content-Type': 'application/json'
        },
        code: 200
    };
    return context.done();

})
