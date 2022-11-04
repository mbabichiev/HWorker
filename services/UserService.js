const UserModel = require('../models/User');
const bcrypt = require('bcrypt');
const TokenService = require('./TokenService');
const MailService = require('./MailService');
const calendarService = require('./CalendarService');
const UserDto = require('../dtos/UserDto');
const ErrorHandler = require('../exeptions/ErrorHandler');

class UserService {

    constructor() {
        this.tokenService = new TokenService();
        this.mailService = new MailService();
    }


    async createUser(firstname, lastname, login, password, email) {
        if (await UserModel.findOne({ login })) {
            throw ErrorHandler.BadRequest(`User with the login ${login} already exists`);
        }

        if (await UserModel.findOne({ email })) {
            throw ErrorHandler.BadRequest(`The email ${email} already in use`);
        }

        password = await bcrypt.hash(password, 8);
        const user = await UserModel.create(
            {
                firstname: firstname,
                lastname: lastname,
                login: login,
                password: password,
                email: email
            });

        console.log("Created user with id: " + user._id);

        const calendar = await calendarService.createCalendar("main", '', 'task', user._id);
        user.own_calendars.push(calendar.calendar.id);
        await user.save();

        const userDto = new UserDto(user);
        const tokens = this.tokenService.generateAccessAndRefreshTokens({ ...userDto });
        this.tokenService.saveRefreshTokenInDb(user._id, tokens.refreshToken);
        this.mailService.sendGreetings(email);

        return { ...tokens, user: userDto }
    }


    async login(login, password) {
        const user = await UserModel.findOne({ login });

        if (!user) {
            throw ErrorHandler.BadRequest(`User with the login ${login} not found`);
        }

        console.log("Login user with id: " + user._id);

        if (!await bcrypt.compare(password, user.password)) {
            throw ErrorHandler.BadRequest(`Wrong password`);
        }

        const userDto = new UserDto(user);
        const tokens = this.tokenService.generateAccessAndRefreshTokens({ ...userDto });
        this.tokenService.saveRefreshTokenInDb(user._id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }


    async logout(refreshToken) {
        this.tokenService.removeRefreshTokenFromDb(refreshToken);
    }


    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw ErrorHandler.UserIsNotAuthorized();
        }

        const userData = this.tokenService.validateRefreshToken(refreshToken);
        if (!userData) {
            throw ErrorHandler.UserIsNotAuthorized();
        }

        const token = this.tokenService.findToken(refreshToken);
        if (!token) {
            throw ErrorHandler.UserIsNotAuthorized();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = this.tokenService.generateAccessAndRefreshTokens({ ...userDto });
        this.tokenService.saveRefreshTokenInDb(user._id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }


    async sendResetLinkToEmail(email) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw ErrorHandler.BadRequest(`User with the email ${email} not found`);
        }

        const tokens = this.tokenService.generateAccessAndRefreshTokens({id: user._id});

        let link = process.env.SERVER_URL + '/api/auth/reset/' + tokens.acessToken;
        this.mailService.sendResetLink(email, link);
    }


    async resetPassword(token, password) {
        const user_id = this.tokenService.validateAccessToken(token).id;

        if(!user_id) {
            throw ErrorHandler.BadRequest(`Token not found`);
        }

        const user = await UserModel.findById(user_id);
        if(!user) {
            throw ErrorHandler.BadRequest(`User not found`);
        }

        user.password = await bcrypt.hash(password, 8);
        user.save();

        const userDto = new UserDto(user);
        const tokens = this.tokenService.generateAccessAndRefreshTokens({ ...userDto });
        this.tokenService.saveRefreshTokenInDb(user._id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

}


module.exports = new UserService();