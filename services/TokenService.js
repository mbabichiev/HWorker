const jwt = require('jsonwebtoken');
const TokenModel = require('../models/Token');

class TokenService {


    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
            return userData;
        } catch (e) {
            return null;
        }
    }


    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
            return userData;
        } catch (e) {
            return null;
        }
    }


    async findToken(refreshToken) {
        const tokenData = await TokenModel.findOne({refreshToken})
        return tokenData;
    }


    generateAccessAndRefreshTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn:"30m"});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn:"30d"});

        return {accessToken, refreshToken};
    }


    async saveRefreshTokenInDb(userId, refreshToken) {
        const token = await TokenModel.findOne({user: userId});

        if(token) {
            token.refreshToken = refreshToken;
            return token.save();
        }
        return await TokenModel.create({user: userId, refreshToken: refreshToken});
    }


    async removeRefreshTokenFromDb(refreshToken) {
        await TokenModel.deleteOne({refreshToken})
    }
}

module.exports = TokenService;