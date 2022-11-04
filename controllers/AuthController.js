const userService = require('../services/UserService');
const {validationResult} = require('express-validator');
const ErrorHandler = require('../exeptions/ErrorHandler');

class AuthController {


    async register(request, response, next) {
        try {
            const errors = validationResult(request);

            if(!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const {firstname, lastname, login, email, password} = request.body;
            const userData = await userService.createUser(firstname, lastname, login, password, email);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return response.status(201).json(userData);
        }
        catch(e) {
            next(e);
        }
    }


    async login(request, response, next) {
        try {
            const errors = validationResult(request);

            if(!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const {login, password} = request.body;
            const userData = await userService.login(login, password);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return response.status(200).json(userData);
        }
        catch(e) {
            next(e);
        }
    }


    logout(request, response, next) {
        try {
            const {refreshToken} = request.cookies;
            userService.logout(refreshToken);
            response.clearCookie('refreshToken');
            response.status(200).send();
        }
        catch(e) {
            next(e);
        }
    }


    async refresh(request, response, next) {
        try {
            const {refreshToken} = request.cookies;
            const userData = await userService.refreshToken(refreshToken);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return response.status(200).json(userData);
        }
        catch(e) {
            next(e);
        }
    }


    async profile(request, response, next) {
        try {
            const {user} = request;
            return response.status(200).json(user);
        }
        catch(e) {
            next(e);
        }
    }


    async sendLinkToResetPassword(request, response, next) {
        try {
            const errors = validationResult(request);

            if(!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const {email} = request.body;
            await userService.sendResetLinkToEmail(email);

            return response.status(200).send();
        }
        catch(e) {
            next(e);
        }
    }


    async resetPassword(request, response, next) {
        try {
            const errors = validationResult(request);

            if(!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const {password} = request.body;
            const token = request.params.token;

            const userData = await userService.resetPassword(token, password);
            response.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return response.status(200).json(userData);
        }
        catch(e) {
            next(e);
        }
    }

}

module.exports = AuthController;