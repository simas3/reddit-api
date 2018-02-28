var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 1, trim: true },
    content: { type: String, required: true, minlength: 1, trim: true },
    createdAt: { type: Number },
    updatedAt: { type: Number, default: null },
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false }
});

postSchema.pre('save', function (next) {
    var post = this;
    // get the current date 
    var currentDate = new Date().getTime();

    // if created_at doesn't exist, add to that field
    if (!post.createdAt)
        post.createdAt = currentDate;
    else
        post.updatedAt = currentDate;

    next();
});

var Post = mongoose.model('Post', postSchema);
module.exports = { Post };