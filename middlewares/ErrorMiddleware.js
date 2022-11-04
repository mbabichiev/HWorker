const ApiHandler = require('../exeptions/ErrorHandler');


module.exports = function(error, request, response, next) {
    console.log(error);

    if(error instanceof ApiHandler) {
        return response.status(error.status).json({
            message: error.message,
            errors: error.errors
        });
    }
    return response.status(500).send();
}