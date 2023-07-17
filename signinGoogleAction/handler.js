const md5 = require('md5');
const crypto = require('crypto');
const axios = require('axios');
const sendHasuraRequest = require('../utils/sendHasuraRequest');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');

module.exports = async function (context) {

    const { client_token } = context.req.body.input;
    try {
        const json = await axios.post('https://oauth2.googleapis.com/tokeninfo', {
            id_token: client_token
        });

        const propForEmail = ['email', 'email_verified'];
        for (let i = 0; i < propForEmail.length; i++) {
            if (!json.data.hasOwnProperty(propForEmail[i])) {

                const errorJson = JSON.stringify({
                    message: "Data google wrong",
                    code: "400"
                });

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

        const upsertUser = `mutation UpsertUser($object: users_insert_input!) {
            insert_users_one(object: $object, on_conflict: {constraint: users_email_key, update_columns: [email, lang, is_authorized, fcm_token, refresh_key]}) {
              id
            }
          }`;

        const password = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
        const hashPassword = md5(password + process.env.SALT);

        const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);

        var variables = {
            "object": {
                email: json.data.email,
                password: hashPassword,
                refresh_key: refreshKey,
                is_authorized: true,
            }
        };


        if (context.req.body.input.hasOwnProperty("lang")) {
            variables.object.lang = context.req.body.input.lang;
        }

        if (context.req.body.input.hasOwnProperty("fcm_token")) {
            variables.object.fcm_token = context.req.body.input.fcm_token;
        }

        const userJson = await sendHasuraRequest(upsertUser, variables, context);
        const token = generateToken(userJson.data.insert_users_one.id);

        const refreshToken = generateRefreshToken(refreshKey, userJson.data.insert_users_one.id);

        const resultJson = {
            access_token: token,
            expires_in: 43000,
            refresh_token: refreshToken,
            token_type: 'Bearer'
        };

        context.res = {
            body: resultJson,
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return context.done();

    } catch (e) {

        const errorJson = {
            message: "Data google wrong",
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
}