const { validationResult } = require('express-validator');
const ErrorHandler = require('../exeptions/ErrorHandler');
const calendarService = require('../services/CalendarService');


class CalendarController {

    async create(request, response, next) {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const { user } = request;
            const { name, description, category } = request.body;
            const calendar = await calendarService.createCalendar(name, description, category, user.id);

            return response.status(200).json(calendar);
        }
        catch (e) {
            next(e);
        }
    }


    async getCalendarById(request, response, next) {
        try {
            const id = request.params.id;
            const { user } = request;
            const calendar = await calendarService.getCalendarById(id, user.id);

            return response.status(200).json(calendar);
        }
        catch (e) {
            next(e);
        }
    }



    async sendLinkToInvite(request, response, next) {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return next(ErrorHandler.BadRequest('Validation error', errors.array()));
            }

            const { user } = request;
            const { calendar_id, email } = request.body;
            await calendarService.inviteUserByCalendarIdAndEmail(user.id, user.firstname + ' ' + user.lastname, calendar_id, email);
            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }


    async goIntoCalendar(request, response, next) {
        try {
            const { user } = request;
            const { token } = request.params;
            const calendar_id = await calendarService.addUserToCalendarByToken(user.id, token);
            return response.redirect(process.env.CLIENT_URL + '/calendars/' + calendar_id);
        }
        catch (e) {
            next(e);
        }
    }


    async updateCalendarById(request, response, next) {
        try {
            const id = request.params.id;
            const { user } = request;
            const { name, description, category } = request.body;
            await calendarService.updateCalendarById(user.id, id, name, description, category);

            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }


    async updateUserInCalendar(request, response, next) {
        try {
            const { calendar_id, user_id } = request.params;
            const { user } = request;
            const { role, color } = request.body;

            await calendarService.updateUserDataInCalendar(user.id, user_id, calendar_id, role, color);
            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }


    async removeUserFromCalendar(request, response, next) {
        try {
            const { calendar_id, user_id } = request.params;
            const { user } = request;
            await calendarService.removeUserFromCalendar(user.id, user_id, calendar_id);

            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }


    async deleteCalendarById(request, response, next) {
        try {
            const id = request.params.id;
            const { user } = request;
            await calendarService.deleteCalendarById(id, user.id);
            return response.status(200).json();
        }
        catch (e) {
            next(e);
        }
    }
}

module.exports = CalendarController;