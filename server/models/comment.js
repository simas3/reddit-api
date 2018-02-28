
var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    text: { type: String, required: true, minlength: 1, trim: true },
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    _post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    _parentcomment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Number },
    updatedAt: { type: Number, default: null }
});



commentSchema.pre('save', function (next) {
    var comment = this;
    // get the current date
    var currentDate = new Date().getTime();

    // if created_at doesn't exist, add to that field
    if (!comment.createdAt)
        comment.createdAt = currentDate;
    else
        comment.updatedAt = currentDate;
    next();
});


var Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };