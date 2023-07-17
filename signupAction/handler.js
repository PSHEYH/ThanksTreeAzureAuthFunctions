const md5 = require("md5");
const sendHasuraRequest = require("../utils/sendHasuraRequest");
const catchAsync = require("../utils/catchAsync");;
const salt = process.env.SALT;

module.exports = catchAsync(async function (context) {

    const { email, password } = context.req.body.input;

    const insertUser = `mutation InsertUser($object: users_insert_input!) {
        insert_users_one(object: $object, on_conflict: {constraint: users_email_key, update_columns: [password, verification_key, lang]}) {
          email
        }
    }`;

    const verification_key = Math.floor(Math.random() * (999999 - 100000) + 100000);
    const hashPassword = md5(password + salt);

    var variables = {
        object: {
            email: email,
            password: hashPassword,
            verification_key: verification_key
        }
    };

    if (context.req.body.input.hasOwnProperty("lang")) {
        variables.object.lang = context.req.body.input.lang;
    }

    const json = await sendHasuraRequest(insertUser, variables, context);

    if (json.data.insert_users_one == null) {

        const errorJson = {
            message: "User exists",
            code: "400"
        };

        context.res = {
            body: errorJson,
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return context.done();
    }

    const result = {
        status: "success"
    };

    context.res = {
        body: result,
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return context.done()

})