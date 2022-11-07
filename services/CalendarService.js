const CalendarModel = require('../models/Calendar');
const UserModel = require('../models/User');
const ErrorHandler = require('../exeptions/ErrorHandler');
const CalendarDto = require('../dtos/CalendarDto');
const TokenService = require('../services/TokenService');
const MailService = require('../services/MailService');
const { default: mongoose } = require('mongoose');

class CalendarService {


    constructor() {
        this.tokenService = new TokenService();
        this.mailService = new MailService();
    }


    #checkForId(id) {
        if (id.length !== 24) {
            throw ErrorHandler.BadRequest(`Invalid id`);
        }
    }


    #checkForCategory(category) {
        if (category !== "arrangement" && category !== "reminder" && category !== "task") {
            throw ErrorHandler.BadRequest(`Category should be only arrangement/reminder/task`);
        }
    }


    #checkIfCalendarAvaliableToUser(calendar, user_id) {
        if (!calendar || !user_id || !calendar.users) {
            return false;
        }

        const users = calendar.users;
        for (var i = 0; users[i]; i++) {
            if (users[i].user_id === user_id) {
                return true;
            }
        }

        return false;
    }


    #checkIfUserIsAdminOrOwner(calendar, user_id) {
        if (!calendar || !user_id || !calendar.users) {
            return false;
        }

        if (calendar.owner_id == user_id) {
            return true;
        }

        const users = calendar.users;
        for (var i = 0; users[i]; i++) {
            if (users[i].user_id === user_id) {
                if (users[i].role === 'user') {
                    return false;
                }
                return true;
            }
        }
        return false;
    }


    async #getUsersFromCalendar(calendar) {
        let arrOfUsersId = [];

        for (var i = 0; calendar.users[i]; i++) {
            arrOfUsersId.push(mongoose.Types.ObjectId(calendar.users[i].user_id));
        }

        const users = await UserModel.find({ '_id': { $in: arrOfUsersId } });

        let usersArrDto = [];

        for (var i = 0; users[i]; i++) {

            let user = calendar.users.find(us => us.user_id == users[i]._id);

            usersArrDto.push({
                id: users[i]._id,
                firstname: users[i].firstname,
                lastname: users[i].lastname,
                login: users[i].login,
                email: users[i].email,
                role: user.role,
                color: user.color
            });
        }

        return usersArrDto;
    }


    // return calendar
    async createCalendar(name, description, category, owner_id) {
        console.log(`Create calendar with name ${name} by user with id ${owner_id}`);

        this.#checkForCategory(category);

        const user = await UserModel.findById(owner_id)
        if (!user) {
            throw ErrorHandler.BadRequest(`User with id ${owner_id} not found`);
        }

        if (await CalendarModel.findOne({ $and: [{ owner_id: owner_id }, { name: name }] })) {
            throw ErrorHandler.BadRequest(`Calendar with name ${name} already exists`);
        }

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

        user.own_calendars.push(calendar._id);
        user.save();

        const calendarDto = new CalendarDto(calendar);
        return { calendar: { ...calendarDto } };
    }


    // return calendar
    async getCalendarById(calendar_id, user_id) {
        console.log(`Get calendar with id ${calendar_id} for user with id: ${user_id}`);

        this.#checkForId(calendar_id);
        this.#checkForId(user_id);

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (!this.#checkIfCalendarAvaliableToUser(calendar, user_id)) {
            throw ErrorHandler.BadRequest(`This calendar is not available to you`);
        }

        return {
            calendar: {
                id: calendar._id,
                name: calendar.name,
                description: calendar.description,
                calegory: calendar.category,
                users: await this.#getUsersFromCalendar(calendar),
                events: calendar.events
            }
        };
    }


    // nothing to return
    async inviteUserByCalendarIdAndEmail(inviter_id, inviter_name, calendar_id, email) {
        console.log("Invite user with email " + email + " to calendar with id: " + calendar_id);

        this.#checkForId(inviter_id);
        this.#checkForId(calendar_id);

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (!this.#checkIfUserIsAdminOrOwner(calendar, inviter_id)) {
            throw ErrorHandler.BadRequest(`Only owner and admins can invite others`);
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ErrorHandler.BadRequest(`User with email ${email} not found`);
        }

        if (user.available_calendars.includes(calendar_id)) {
            throw ErrorHandler.BadRequest(`User with email ${email} (${user.login}) is already using this calendar`);
        }

        if (user.own_calendars.includes(calendar_id)) {
            throw ErrorHandler.BadRequest(`You can't invite yourself`);
        }

        if (this.#checkIfCalendarAvaliableToUser(calendar, user._id)) {
            throw ErrorHandler.BadRequest(`User with email ${email} is already using this calendar`);
        }

        const token = this.tokenService.generateAccessAndRefreshTokens({ id: calendar_id });
        this.mailService.sendInvitation(email, process.env.SERVER_URL + '/api/calendars/go-into/' + token.accessToken, inviter_name, calendar.name);
    }


    // nothing to return
    async removeUserFromCalendar(remover_id, user_id, calendar_id) {
        console.log("Remove user with id " + user_id + " from calendar with id: " + calendar_id);

        this.#checkForId(user_id);
        this.#checkForId(calendar_id);

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (!this.#checkIfCalendarAvaliableToUser(calendar, remover_id)) {
            throw ErrorHandler.BadRequest(`This calendar is not available to you`);
        }

        if (!this.#checkIfCalendarAvaliableToUser(calendar, user_id)) {
            throw ErrorHandler.BadRequest(`User don't use this calendar`);
        }

        if (user_id == calendar.owner_id) {
            throw ErrorHandler.BadRequest(`Noone can remove owner from calendar`);
        }

        let remover_role = '';
        let user_role = '';
        let user_index_in_arr;

        for (var i = 0; calendar.users[i]; i++) {
            if (remover_role !== '' && user_role !== '') {
                break;
            }

            if (calendar.users[i].user_id === remover_id) {
                remover_role = calendar.users[i].role;
            }

            if (calendar.users[i].user_id === user_id) {
                user_role = calendar.users[i].role;
                user_index_in_arr = i;
            }
        }

        if (remover_role === 'user' && remover_id !== user_id) {
            throw ErrorHandler.BadRequest(`Only owner and admins can edit users in calendar`);
        }

        if (remover_role === 'admin' && user_role === 'admin') {
            throw ErrorHandler.BadRequest(`Only owner can remove admins from calendar`);
        }

        const user = await UserModel.findById(user_id);
        if (!user) {
            throw ErrorHandler.BadRequest('User not found');
        }

        let indexOfCalendar = user.available_calendars.indexOf(calendar_id);
        user.available_calendars.splice(indexOfCalendar, 1);
        user.save();

        if (user_index_in_arr) {
            calendar.users.splice(user_index_in_arr, 1);
            calendar.save();
        }
    }


    // nothing to return
    async updateUserDataInCalendar(updater_id, user_id, calendar_id, user_role, user_color) {
        console.log(`Update user with id ${user_id} in calendar with id ${calendar_id} by user with id ${updater_id}`);

        this.#checkForId(user_id);
        this.#checkForId(calendar_id);

        if (user_role && user_role !== 'admin' && user_role !== 'user') {
            throw ErrorHandler.BadRequest('Invalid role');
        }

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest('Calendar not found');
        }

        if (!this.#checkIfCalendarAvaliableToUser(calendar, updater_id)) {
            throw ErrorHandler.BadRequest(`This calendar is not available to you`);
        }

        if (!this.#checkIfCalendarAvaliableToUser(calendar, user_id)) {
            throw ErrorHandler.BadRequest(`User don't use this calendar`);
        }

        if (user_role && updater_id != calendar.owner_id) {
            throw ErrorHandler.BadRequest(`Only owner can change roles of calendar users`);
        }

        let updater_role = '';
        let updater_index;
        let current_user_role = '';
        let current_user_index;

        for (var i = 0; calendar.users[i]; i++) {
            if (updater_role !== '' && current_user_role !== '') {
                break;
            }

            if (calendar.users[i].user_id === updater_id) {
                updater_role = calendar.users[i].role;
                updater_index = i;
            }

            if (calendar.users[i].user_id === user_id) {
                current_user_role = calendar.users[i].role;
                current_user_index = i;
            }
        }

        if (user_role) {
            calendar.users[current_user_index].role = user_role;
        }

        if (user_color) {
            if (updater_role === 'user') {
                throw ErrorHandler.BadRequest(`Only owner and admins can edit theme colors of others`);
            }

            if (updater_role === 'admin' && current_user_role === 'admin') {
                throw ErrorHandler.BadRequest(`Only owner can edit theme colors of admins`);
            }

            calendar.users[current_user_index].color = user_color;
        }

        calendar.save();
    }


    // return calendar id
    async addUserToCalendarByToken(user_id, token) {
        console.log(`Add user with id ${user_id} to the calendar`);
        if (!token) {
            throw ErrorHandler.BadRequest('Invalid token');
        }

        this.#checkForId(user_id);

        token = this.tokenService.validateAccessToken(token);
        if (!token) {
            throw ErrorHandler.BadRequest('Token is not valid');
        }

        const calendar_id = token.id;
        this.#checkForId(calendar_id);
        const calendar = await CalendarModel.findById(calendar_id);

        if (!calendar) {
            throw ErrorHandler.BadRequest('Calendar not found');
        }

        const user = await UserModel.findById(user_id);
        if (!user) {
            throw ErrorHandler.BadRequest('User not found');
        }

        if (user.own_calendars.includes(calendar_id) || user.available_calendars.includes(calendar_id)) {
            throw ErrorHandler.BadRequest('You are already using this calendar');
        }

        user.available_calendars.push(calendar_id);
        user.save();

        calendar.users.push({
            user_id: user_id,
            role: "user"
        });

        calendar.save();
        return calendar_id;
    }


    // nothing to return
    async updateCalendarById(user_id, calendar_id, name, description, category) {
        console.log("Update calendar with id " + calendar_id + " by user with id: " + user_id);

        this.#checkForId(calendar_id);

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (calendar.owner_id != user_id) {
            throw ErrorHandler.BadRequest(`Calendar can be edited only by owner`);
        }

        if (name && calendar.name === "main") {
            throw ErrorHandler.BadRequest(`You can't change the name of the main calendar`);
        }

        if (name) {
            calendar.name = name;
        }

        if (description) {
            calendar.description = description;
        }

        if (category) {
            this.#checkForCategory(category);
            calendar.category = category;
        }

        calendar.save();
    }


    // nothing to return
    async deleteCalendarById(calendar_id, user_id) {
        console.log("Delete calendar with id " + calendar_id + " by user with id: " + user_id);

        this.#checkForId(calendar_id);

        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (calendar.owner_id != user_id) {
            throw ErrorHandler.BadRequest(`Calendar can be deleted only by owner`);
        }

        if (calendar.name === "main") {
            throw ErrorHandler.BadRequest(`You can't delete the main calendar`);
        }

        const author = await UserModel.findById(calendar.owner_id);
        var author_index = author.own_calendars.indexOf(calendar_id);
        if (author_index !== -1) {
            author.own_calendars.splice(author_index, 1);
            author.save();
        }

        for (var i = 0; calendar.users[i]; i++) {
            console.log("Delete from avaliable calendars for user with id: " + calendar.users[i].user_id);

            const user = await UserModel.findById(calendar.users[i].user_id);
            if (!user) {
                continue;
            }

            var index = user.available_calendars.indexOf(calendar_id);
            if (index !== -1) {
                user.available_calendars.splice(index, 1);
                user.save();
            }
        }

        await CalendarModel.deleteOne({ _id: calendar_id });
    }
}

module.exports = new CalendarService();