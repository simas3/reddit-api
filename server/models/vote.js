var mongoose = require('mongoose');

var voteSchema = new mongoose.Schema({
    _comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    amount: { type: Number, required: true },
    _voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

voteSchema.pre('save', function (next) {
    var vote = this;
    // get the current date 
    var currentDate = new Date().getTime();

    next();
});

var Vote = mongoose.model('Vote', voteSchema);
module.exports = { Vote };
