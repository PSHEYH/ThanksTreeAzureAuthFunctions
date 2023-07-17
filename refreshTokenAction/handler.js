const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendHasuraRequest = require('../utils/sendHasuraRequest');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');

module.exports = catchAsync(async function (context) {

    const { refresh_token } = context.req.body.input;

    let decoded;

    try {
        decoded = await promisify(jwt.verify)(refresh_token, process.env.JWT_KEY);
    } catch (error) {
        context.res = {
            body: {
                "message": "Invalid token",
                "code": 401
            },
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return context.done();
    }

    const newRefreshKey = crypto.randomBytes(Math.ceil(64 / 2)).toString('hex').slice(0, 64);

    const refreshUser = `mutation RefreshUser($set: users_set_input, $id: uuid!) {
        update_users_by_pk(pk_columns: {id: $id}, _set: $set) {
          id
        }
      }`;

    const variables = {
        id: decoded.sub,
        set: {
            refresh_key: newRefreshKey
        }
    };

    const json = await sendHasuraRequest(refreshUser, variables, context);

    if (json.data.update_users_by_pk) {

        const token = generateToken(decoded.sub);

        const newRefreshToken = generateRefreshToken(newRefreshKey, decoded.sub);

        const result = {
            access_token: token,
            token_type: "Bearer",
            expires_in: 43000,
            refresh_token: newRefreshToken
        }

        context.res = {
            body: result,
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        };
        return context.done();
    }
    else {
        const errorJson = {
            message: "Refresh token is invalid",
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

})