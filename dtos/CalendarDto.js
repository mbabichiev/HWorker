module.exports = class CalendarDto {
    
    constructor(model) {
        this.id = model._id;
        this.name = model.name;
        this.description = model.description;
        this.category = model.category;
        this.users = model.users;
        this.events = model.events;
    }
}