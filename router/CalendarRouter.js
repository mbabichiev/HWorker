const express = require("express");
const CalendarController = require("../controllers/CalendarController");
const EventController = require('../controllers/EventController');
const categoryMiddleware = require('../middlewares/CategoryMiddleware');
const {body} = require('express-validator');

const calendarRouter = express.Router();
const calendarController = new CalendarController();
const eventController = new EventController();


calendarRouter.post('/invite', body('email').isEmail(), body('calendar_id').isLength({min: 24, max: 24}), calendarController.sendLinkToInvite)
calendarRouter.post("/", categoryMiddleware, body('name').isLength({min: 1, max: 20}), body('description').isLength({max: 100}), calendarController.create);
calendarRouter.post('/:id/events', body('name').isLength({min: 1, max: 20}), eventController.createEvent);

calendarRouter.get('/go-into/:token', calendarController.goIntoCalendar);
calendarRouter.get("/:calendar_id/events", eventController.getEventsByCalendarId);
calendarRouter.get("/:calendar_id/events/:event_id", eventController.getEventById);
calendarRouter.get("/:id", calendarController.getCalendarById);

calendarRouter.patch("/:id", calendarController.updateCalendarById);
calendarRouter.patch("/:calendar_id/user/:user_id", calendarController.updateUserInCalendar);
calendarRouter.patch("/:calendar_id/events/:event_id", body('name').isLength({max: 20}), eventController.updateEvent);

calendarRouter.delete("/:calendar_id/user/:user_id", calendarController.removeUserFromCalendar);
calendarRouter.delete("/:calendar_id/events/:event_id", eventController.deleteEvent);
calendarRouter.delete("/:id", calendarController.deleteCalendarById);


module.exports = calendarRouter;