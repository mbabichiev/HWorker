const express = require("express");
const CalendarController = require("../controllers/CalendarController");
const authMiddleware = require('../middlewares/AuthMiddleware');
const categoryMiddleware = require('../middlewares/CategoryMiddleware');
const {body} = require('express-validator');

const calendarRouter = express.Router();
const calendarController = new CalendarController();


calendarRouter.post('/invite', body('email').isEmail(), body('calendar_id').isLength({min: 24, max: 24}), calendarController.sendLinkToInvite)
calendarRouter.post("/", categoryMiddleware, body('name').isLength({min: 1, max: 20}), body('description').isLength({max: 100}), calendarController.create);

calendarRouter.get('/go-into/:token', calendarController.goIntoCalendar);
calendarRouter.get("/:id", calendarController.getCalendarById);

calendarRouter.patch("/:id", calendarController.updateCalendarById);
calendarRouter.patch("/:calendar_id/user/:user_id", calendarController.updateUserInCalendar);

calendarRouter.delete("/:calendar_id/user/:user_id", calendarController.removeUserFromCalendar);
calendarRouter.delete("/:id", calendarController.deleteCalendarById);



module.exports = calendarRouter;