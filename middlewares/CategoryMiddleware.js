const ErrorHandler = require('../exeptions/ErrorHandler');

module.exports = function (request, response, next) {
    const { category } = request.body;
    if (!category) {
        return next(ErrorHandler.BadRequest("Category is null"));
    }

    if (category !== 'arrangement' && category !== 'reminder' && category !== 'task') {
        return next(ErrorHandler.BadRequest("Category should be only: arrangement, reminder, or task"));
    }
    next();
}