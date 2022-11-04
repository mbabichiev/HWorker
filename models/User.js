const {Schema, model} = require('mongoose');


const User = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    login: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    own_calendars: [{type: Schema.Types.ObjectId, ref: 'Calendar'}],
    available_calendars: {type: Array}
});


module.exports = model('User', User);