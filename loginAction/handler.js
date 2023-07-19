var bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendHasuraRequest = require('../utils/sendHasuraRequest');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const catchAsync = require('../utils/catchAsync');

function compareAsync(password, userPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(password, userPassword, function(err, res) {
            if (err) {
                 reject(err);
            } else {
                 resolve(res);
            }
        });
    });
}

module.exports = catchAsync(async function (context) {

    const { email, password } = context.req.body.input;

    const userByEmail = `query FindUserByEmail($email: String!){
                users(where:{ email:{ _eq:$email}}){
                      id
                  password
                }
              }
              `;

    const user = await sendHasuraRequest(userByEmail, { email: email });

    if (user.data.users.length == 0) {

        context.res = {
            body: {
                body: 'User not found',
                code: 404
            },
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        };

        return context.done();

    }
    else {

        if (await compareAsync(password, user.data.users[0].password) === false) {
            context.res = {
                body: {
                    body: 'Wrong password',
                    code: 400
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            };

            return context.done();
        }

        const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);

        var variables = {
            id: user.data.users[0].id,
            _set: {
                refresh_key: refreshKey,
                is_authorized: true,
            }
        };

        const updateUser = `mutation UpdateUser($id: uuid!, $_set: users_set_input!) {
            update_users_by_pk(pk_columns: {id: $id}, _set: $_set) {
              id
            }
          }
          `;

        if (context.req.body.input.hasOwnProperty("lang")) {
            variables.object.lang = context.req.body.input.lang;
        }

        if (context.req.body.input.hasOwnProperty("fcm_token")) {
            variables.object.fcm_token = context.req.body.input.fcm_token;
        }

        const userJson = await sendHasuraRequest(updateUser, variables, context);

        const token = generateToken(userJson.data.update_users_by_pk.id);

        const refreshToken = generateRefreshToken(refreshKey, userJson.data.update_users_by_pk.id);

        const resultJson = {
            access_token: token,
            expires_in: 43000,
            refresh_token: refreshToken,
            token_type: 'Bearer'
        };

        context.res = {
            body: resultJson,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        };

        return context.done();

    }
})