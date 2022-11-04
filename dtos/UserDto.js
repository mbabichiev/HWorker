module.exports = class UserDto {
    
    constructor(model) {
        this.id = model._id;
        this.firstname = model.firstname;
        this.lastname = model.lastname;
        this.login = model.login;
        this.email = model.email;
        this.own_calendars = model.own_calendars;
        this.available_calendars = model.available_calendars;
    }
}