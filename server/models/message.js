var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 1, trim: true },
    content: { type: String, required: true, minlength: 1, trim: true },
    sentAt: { type: Number },
    openedAt: { type: Number, default: null },
    _sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    _receiver: { type: mongoose.Schema.Types.ObjectId, required: true }
});

messageSchema.pre('save', function (next) {
    var message = this;
    // get the current date
    var currentDate = new Date().getTime();

    // if created_at doesn't exist, add to that field
    if (!message.sentAt)
        message.sentAt = currentDate;
    else if (!message.openedAt)
        message.openedAt = currentDate;
    next();
});


var Message = mongoose.model('Message', messageSchema);
module.exports = { Message };