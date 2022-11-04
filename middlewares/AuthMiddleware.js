const ErrorHandler = require('../exeptions/ErrorHandler');
const TokenService = require('../services/TokenService');

const tokenService = new TokenService();

module.exports = function (request, response, next) {
    try {
        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader) {
            return next(ErrorHandler.UserIsNotAuthorized());
        }

        const acessToken = authorizationHeader.split(' ')[1];
        if (!acessToken) {
            return next(ErrorHandler.UserIsNotAuthorized());
        }

        const userData = tokenService.validateAccessToken(acessToken);
        if(!userData) {
            return next(ErrorHandler.UserIsNotAuthorized());
        }

        request.user = userData;
        next();

    } catch (e) {
        return next(ErrorHandler.UserIsNotAuthorized());
    }
}