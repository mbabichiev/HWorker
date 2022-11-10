const { validationResult } = require('express-validator');
const ErrorHandler = require('../exeptions/ErrorHandler');
const eventService = require('../services/EventService');


class EventController {

    
    async createEvent(request, response, next) {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const { user } = request;
            const { name, start_time, end_time } = request.body;
            const { id } = request.params;
            const event = await eventService.createEvent(user.id, id, name, start_time, end_time);

            return response.status(200).json(event);
        }
        catch (e) {
            next(e);
        }
    }


    async getEventById(request, response, next) {
        try {
            const { user } = request;
            const { calendar_id, event_id } = request.params;
            const event = await eventService.getEventById(user.id, calendar_id, event_id);
            return response.status(200).json(event);
        }
        catch (e) {
            next(e);
        }
    }


    async getEventsByCalendarId(request, response, next) {
        try {
            const { user } = request;
            const { calendar_id } = request.params;
            const events = await eventService.getEventsByCalendarId(user.id, calendar_id);
            return response.status(200).json(events);
        }
        catch (e) {
            next(e);
        }
    }


    async updateEvent(request, response, next) {
        try {
            const { user } = request;
            const { calendar_id, event_id } = request.params;
            const { name, start_time, end_time } = request.body;
            await eventService.updateEventById(user.id, calendar_id, event_id, name, start_time, end_time);
            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }


    async deleteEvent(request, response, next) {
        try {
            const { user } = request;
            const { calendar_id, event_id } = request.params;
            await eventService.deleteEventById(user.id, calendar_id, event_id);

            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }
}

module.exports = EventController;