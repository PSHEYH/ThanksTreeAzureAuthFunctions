const sendHasuraRequest = require('../utils/sendHasuraRequest');
const catchAsync = require('../utils/catchAsync');


module.exports = catchAsync(async function (context) {

    const updateSession = `mutation UpdateUser($set: users_set_input!, $id: uuid!) {
        update_users(where: {id: {_eq: $id}}, _set: $set) {
          affected_rows
        }
      }
      `;


    const variables = {
        id: context.req.body.session_variables['x-hasura-user-id'],
        set: {
            "is_authorized": false,
            "refresh_key": null
        }
    };

    const json = await sendHasuraRequest(updateSession, variables, context);


    if (json.data.update_users.affected_rows > 0) {
        context.res = {
            body: { status: "success" },
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        };
        return context.done();
    }
    else {
        const errorJson = {
            message: "Not fount",
            code: "404"
        }
        context.res = {
            body: errorJson,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        };

        return context.done();
    }
})