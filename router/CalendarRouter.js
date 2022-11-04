const express = require("express");
const CalendarController = require("../controllers/CalendarController");
const authMiddleware = require('../middlewares/AuthMiddleware');
const categoryMiddleware = require('../middlewares/CategoryMiddleware');
const {body} = require('express-validator');

const calendarRouter = express.Router();
const calendarController = new CalendarController();

calendarRouter.post("/", 
    authMiddleware,
    categoryMiddleware,
    body('name').isLength({min: 1, max: 12}),  
    calendarController.create);



module.exports = calendarRouter;