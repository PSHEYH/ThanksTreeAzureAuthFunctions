const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const appleSignIn = require('apple-signin-auth');
const sendHasuraRequest = require('../utils/sendHasuraRequest');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');

module.exports = async function (context) {

    const { client_id, identity_token } = context.req.body.input;
    try {
        const { sub: userAppleId, email } = await appleSignIn.verifyIdToken(identity_token);

        if (userAppleId !== client_id) {
            const errorJson = {
                message: "Apple data error",
                code: "400"
            };

            context.res = {
                body: errorJson,
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            };

            return context.done();
        }
        else {

            const password = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);
            const hashPassword = bcrypt.hash(password);

            const upsertUser = `mutation UpsertUser($object: users_insert_input!) {
                insert_users_one(object: $object, on_conflict: {constraint: users_email_key, update_columns: [email, lang, is_authorized, fcm_token, refresh_key]}) {
                  id
                }
              }
              `;
            const refreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);

            var variables = {
                object: {
                    email: email,
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
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            };

            return context.done();
        }

    } catch (error) {
        const errorJson = {
            message: "Apple data error",
            code: "400"
        };

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