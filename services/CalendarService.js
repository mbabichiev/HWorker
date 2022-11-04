const CalendarModel = require('../models/Calendar');
const UserModel = require('../models/User');
const ErrorHandler = require('../exeptions/ErrorHandler');
const CalendarDto = require('../dtos/CalendarDto');

class CalendarService {


    async createCalendar(name, description, category, owner_id) {
        if(!await UserModel.findById(owner_id)) {
            throw ErrorHandler.BadRequest(`User with id ${owner_id} not found`);
        }

        if(await CalendarModel.findOne({$and: [{owner_id: owner_id}, {name: name}]})) {
            throw ErrorHandler.BadRequest(`Calendar with name ${name} already exists`);
        }

        console.log(`Create calendar with name ${name} by user with id ${owner_id}`)

        const calendar = await CalendarModel.create({
            owner_id: owner_id, 
            name: name,
            description: description,
            category: category,
            users: [{
                user_id: owner_id,
                role: "owner"
            }]
        })

        const calendarDto = new CalendarDto(calendar);

        return {calendar: {...calendarDto}};
    }


    async getCalendarById(id) {

    }


    async updateCalendarById(id, calendar) {

    }


    async deleteCalendarById(id) {

    }

}

module.exports = new CalendarService();