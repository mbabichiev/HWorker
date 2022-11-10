const EventModel = require('../models/Event');
const CalendarModel = require('../models/Calendar');
const EventDto = require('../dtos/EventDto');
const ErrorHandler = require('../exeptions/ErrorHandler');


class EventService {


    #checkForId(id) {
        if (id && id.length !== 24) {
            throw ErrorHandler.BadRequest(`Invalid id`);
        }
    }


    #checkIfUserIsAvaliableTheCalendar(calendar, user_id) {
        if (calendar.users.find(user => user.user_id == user_id)) {
            return true;
        }
        return false;
    }


    #getEventDto(event) {
        const eventDto = new EventDto(event);
        return { ...eventDto };
    }


    async #checkIfTimeEventOverlapsWithOtherEvents(time_event, arrEventsIds, event_id = 0) {
        if (!time_event || !arrEventsIds) {
            return false;
        }

        if (arrEventsIds.length === 0) {
            return true;
        }

        const events = await EventModel.find({ '_id': { $in: arrEventsIds } });
        events.sort((a, b) => a.start_time - b.start_time); // now events are sorted by start time

        for (var i = 0; events[i]; i++) {
            if (time_event < events[i].start_time) {
                break;
            }

            if (time_event >= events[i].start_time && time_event <= events[i].end_time && String(event_id) !== String(events[i]._id)) {
                return false;
            }
        }
        return true;
    }


    async #getAndCheckCalendar(calendar_id, user_id) {
        const calendar = await CalendarModel.findById(calendar_id);
        if (!calendar) {
            throw ErrorHandler.BadRequest(`Calendar not found`);
        }

        if (!this.#checkIfUserIsAvaliableTheCalendar(calendar, user_id)) {
            throw ErrorHandler.BadRequest(`Calendar is not avaliable for you`);
        }

        return calendar;
    }


    async createEvent(user_id, calendar_id, name, start_time, end_time) {
        console.log(`Create event in the calendar with id ${calendar_id} by user with id: ${user_id}`);

        this.#checkForId(user_id);
        this.#checkForId(calendar_id);

        console.log(Date.now());

        if (start_time < Date.now()) {
            throw ErrorHandler.BadRequest(`You cannot create events in the past`);
        }

        if (end_time - start_time < 1000) {
            throw ErrorHandler.BadRequest(`Min time for event - 1 second`);
        }

        const calendar = await this.#getAndCheckCalendar(calendar_id, user_id);

        const events = calendar.events;
        if (!await this.#checkIfTimeEventOverlapsWithOtherEvents(start_time, events) ||
            !await this.#checkIfTimeEventOverlapsWithOtherEvents(end_time, events)) {
            throw ErrorHandler.BadRequest(`The time of the event overlaps with others`);
        }

        const event = await EventModel.create({
            owner_id: user_id,
            calendar_id: calendar_id,
            name: name,
            start_time: start_time,
            end_time: end_time
        });

        calendar.events.push(event._id);
        calendar.save();

        return this.#getEventDto(event);
    }


    async getEventById(user_id, calendar_id, event_id) {
        console.log(`Get event with id ${event_id} in calendar with id ${calendar_id} by user with id ${user_id}`);

        this.#checkForId(user_id);
        this.#checkForId(calendar_id);
        this.#checkForId(event_id);

        await this.#getAndCheckCalendar(calendar_id, user_id);

        const event = await EventModel.findById(event_id);
        if (!event) {
            throw ErrorHandler.BadRequest(`Event not found`);
        }

        if (event.calendar_id != calendar_id) {
            throw ErrorHandler.BadRequest(`This event not for this calendar`);
        }

        return this.#getEventDto(event);
    }


    async getEventsFromArrIds(arrIds) {
        const events = await EventModel.find({ '_id': { $in: arrIds } });
        events.sort((a, b) => a.start_time - b.start_time);
        let eventsArrDto = [];

        for (var i = 0; events[i]; i++) {
            eventsArrDto.push(this.#getEventDto(events[i]));
        }

        return eventsArrDto;
    }


    async getEventsByCalendarId(user_id, calendar_id) {
        console.log(`Get events in calendar with id ${calendar_id} by user with id ${user_id}`);

        this.#checkForId(user_id);
        this.#checkForId(calendar_id);

        const calendar = await this.#getAndCheckCalendar(calendar_id, user_id);

        return await this.getEventsFromArrIds(calendar.events);
    }


    async updateEventById(updater_id, calendar_id, event_id, name, start_time, end_time) {
        console.log(`Update event with id ${event_id} in calendar with id ${calendar_id} by user with id ${updater_id}`);

        this.#checkForId(updater_id);
        this.#checkForId(calendar_id);
        this.#checkForId(event_id);

        const calendar = await this.#getAndCheckCalendar(calendar_id, updater_id);

        const event = await EventModel.findById(event_id);
        if (!event) {
            throw ErrorHandler.BadRequest(`Event not found`);
        }

        if (event.calendar_id != calendar_id) {
            throw ErrorHandler.BadRequest(`This event not for this calendar`);
        }

        const updater = calendar.users.find(us => us.user_id == updater_id);
        const user = calendar.users.find(us => us.user_id == event.owner_id);

        if (updater.role === 'user' && event.owner_id !== updater_id) {
            throw ErrorHandler.BadRequest(`Users can edit only own events`);
        }

        if (updater.role === 'admin' && user.role !== 'user' && event.owner_id !== updater_id) {
            throw ErrorHandler.BadRequest(`Admins can edit only own events and events of users`);
        }

        if(name) {
            event.name = name;
        }

        if(start_time) {
            if(await this.#checkIfTimeEventOverlapsWithOtherEvents(start_time, calendar.events, event._id)) {
                event.start_time = start_time;
            }
            else {
                throw ErrorHandler.BadRequest(`The time of the event overlaps with others`);
            }
        }

        if(end_time) {
            if(await this.#checkIfTimeEventOverlapsWithOtherEvents(end_time, calendar.events, event._id)) {
                event.end_time = end_time;
            }
            else {
                throw ErrorHandler.BadRequest(`The time of the event overlaps with others`);
            }
        }

        event.save();
    }


    async deleteEventById(deleter_id, calendar_id, event_id) {
        console.log(`Delete event with id ${event_id} in calendar with id ${calendar_id} by user with id ${deleter_id}`);

        this.#checkForId(deleter_id);
        this.#checkForId(calendar_id);
        this.#checkForId(event_id);

        const calendar = await this.#getAndCheckCalendar(calendar_id, deleter_id);

        const event = await EventModel.findById(event_id);
        if (!event) {
            throw ErrorHandler.BadRequest(`Event not found`);
        }

        if (event.calendar_id != calendar_id) {
            throw ErrorHandler.BadRequest(`This event not for this calendar`);
        }

        const deleter = calendar.users.find(us => us.user_id == deleter_id);
        const user = calendar.users.find(us => us.user_id == event.owner_id);

        if (deleter.role === 'user' && event.owner_id !== deleter_id) {
            throw ErrorHandler.BadRequest(`Users can delete only own events`);
        }

        if (deleter.role === 'admin' && user.role !== 'user' && event.owner_id !== deleter_id) {
            throw ErrorHandler.BadRequest(`Admins can delete only own events and events of users`);
        }

        var event_index = calendar.events.indexOf(event_id);
        if (event_index !== -1) {
            calendar.events.splice(event_index, 1);
            calendar.save();
        }

        await EventModel.deleteOne({ _id: event._id });
    }


    async deleteInactiveEvents() {
        console.log("Deleting old events...");
        const events = await EventModel.find({ end_time: { $lt: Date.now() - 60 * 1000 } });

        if (events.length === 0) {
            console.log("Nothing to delete");
        }

        for (var i = 0; events[i]; i++) {
            console.log("Delete event with id: " + events[i]._id);

            const calendar = await CalendarModel.findById(events[i].calendar_id);
            if (!calendar) {
                console.log("Calendar not found, continue. calendar id: " + events[i].calendar_id);
                continue;
            }

            var event_index = calendar.events.indexOf(events[i]._id);
            if (event_index !== -1) {
                calendar.events.splice(event_index, 1);
                calendar.save();
            }

            await EventModel.deleteOne({ _id: events[i]._id });
        }
    }
}


module.exports = new EventService();