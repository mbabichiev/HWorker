const { Schema, model } = require('mongoose');


const Event = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    calendar_id: { type: Schema.Types.ObjectId, ref: 'Calendar', required: true },
    name: { type: String, required: true },
    start_time: {
        type: Number, required: true, validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    end_time: {
        type: Number, required: true, validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    }
});


module.exports = model('Event', Event);