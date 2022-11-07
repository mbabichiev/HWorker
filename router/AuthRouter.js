const express = require("express");
const AuthController = require("../controllers/authController.js");
const authMidleware = require('../middlewares/AuthMiddleware');
const {body} = require('express-validator');

const authRouter = express.Router();
const authController = new AuthController();


// request: 
// {
//      "firstname": "firstname",
//      "lastname": "lastname",    
//      "login": "login",
//      "email": "example@gmail.com",
//      "password": "password"
// }

// response:
// {   
//      "accessToken": "token",  
//      "refreshToken": "token",
//      "user": {
//          "id": "id",
//          "firstname": "firstname",
//          "lastname": "lastname",    
//          "login": "login",
//          "email": "example@gmail.com",
//          "own_calendars": ["id main calendar"],
//          "available_calendars": []
//      }
// }
authRouter.post("/register", 
    body('email').isEmail(), 
    body('firstname').isLength({min: 1, max: 12}), 
    body('lastname').isLength({min: 1, max: 12}), 
    body('login').isLength({min: 6, max: 12}), 
    body('password').isLength({min: 6, max: 12}), 
    authController.register);


// request: 
// {   
//      "login": "login",
//      "password": "password"
// }

// response:
// {   
//      "accessToken": "token",  
//      "refreshToken": "token",
//      "user": {
//          "id": "id",
//          "firstname": "firstname",
//          "lastname": "lastname",    
//          "login": "login",
//          "email": "example@gmail.com",
//          "own_calendars": ["calendars id"],
//          "available_calendars": ["calendars id"]
//      }
// }
authRouter.post('/login', 
    body('login').isLength({min: 6, max: 12}), 
    body('password').isLength({min: 6, max: 12}), 
    authController.login);


// request: Bearer 'access_token'
// response: status code 200 
authRouter.post('/logout', authController.logout);


// request: refreshToken in cookies

// response:
// {   
//      "accessToken": "token",  
//      "refreshToken": "token",
//      "user": {
//          "id": "id",
//          "firstname": "firstname",
//          "lastname": "lastname",    
//          "login": "login",
//          "email": "example@gmail.com",
//          "own_calendars": ["calendars id"],
//          "available_calendars": ["calendars id"]
//      }
// }
authRouter.post('/refresh', authController.refresh);


// request: request.headers.authorization = 'Bearer "accessToken"'

// response:
// {   
//      "accessToken": "token",  
//      "refreshToken": "token",
//      "user": {
//          "id": "id",
//          "firstname": "firstname",
//          "lastname": "lastname",    
//          "login": "login",
//          "email": "example@gmail.com",
//          "own_calendars": ["calendars id"],
//          "available_calendars": ["calendars id"]
//      }
//      "iat": 1667589606,
//      "exp": 1667591406
// }
authRouter.get('/profile', authMidleware, authController.profile);


// request: 
// {   
//      "email": "example@gmail.com"
// }

// response: status code 200 
// send email with link 
authRouter.post('/reset', body('email').isEmail(), authController.sendLinkToResetPassword)


// request: 
// {   
//      "password": "password"
// }

// response:
// {   
//      "accessToken": "token",  
//      "refreshToken": "token",
//      "user": {
//          "id": "id",
//          "firstname": "firstname",
//          "lastname": "lastname",    
//          "login": "login",
//          "email": "example@gmail.com",
//          "own_calendars": ["calendars id"],
//          "available_calendars": ["calendars id"]
//      }
// }
authRouter.post('/reset/:token', body('password').isLength({min: 6, max: 12}), authController.resetPassword)




module.exports = authRouter;