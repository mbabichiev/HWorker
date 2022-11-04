module.exports = class ErrorHandler extends Error {

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }


    static UserIsNotAuthorized() {
        return new ErrorHandler(401, "User is not authorized")
    }


    static BadRequest(message, errors = []) {
        return new ErrorHandler(400, message, errors);
    }
}