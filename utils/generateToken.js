var jwt = require('jsonwebtoken');

const generateToken = (user_id) => {
    const exp = Math.floor(Date.now() / 1000) + 43200;
    const dataToken = {
        sub: user_id,
        iat: Math.floor(Date.now() / 1000),
        exp: exp,
        "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": user_id,
        }
    };

    const token = jwt.sign(dataToken, process.env.JWT_KEY);
    return token;
}

module.exports = generateToken;