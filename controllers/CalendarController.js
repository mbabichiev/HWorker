const {validationResult} = require('express-validator');
const ErrorHandler = require('../exeptions/ErrorHandler');
const calendarService = require('../services/CalendarService');


class CalendarController {

    async create(request, response, next) {
        try {
            const errors = validationResult(request);
            if(!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const {user} = request;
            const {name, description, category} = request.body;
            const calendar = await calendarService.createCalendar(name, description, category, user.id);

            return response.status(200).json(calendar);
        }
        catch(e) {
            next(e);
        }
    }
}

module.exports = CalendarController;