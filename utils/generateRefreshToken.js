var jwt = require('jsonwebtoken');

const generateRefreshToken = (refreshKey, user_id) => {

    const dataRefreshToken = {
        "sub": user_id,
        "iat": Math.floor(Date.now() / 1000),
        "refresh_key": refreshKey,
    };

    const refreshToken = jwt.sign(dataRefreshToken, process.env.JWT_KEY);
    return refreshToken;
}

module.exports = generateRefreshToken;