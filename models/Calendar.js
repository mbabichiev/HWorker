const {Schema, model} = require('mongoose');


const Calendar = new Schema({
    owner_id: {type: Schema.Types.ObjectId, ref: 'User'},
    name: {type: String, required: true},
    description: {type: String, default: ''},
    category: {type: String, required: true, default: "task"},
    users: [{
        user_id: {type: String, required: true},
        role: {type: String, required: true, default: "user"},
        color: {type: String, required: true, default: "rgb(57, 58, 62)"}
    }],
    events: {type: Array, default: []}
});


module.exports = model('Calendar', Calendar);