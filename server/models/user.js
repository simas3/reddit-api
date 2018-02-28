

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 1, trim: true, unique: true },
    email: {
        type: String, required: true, minlength: 1, trim: true, unique: true,
        validate: { validator: validator.isEmail, message: '{VALUE} is not a valid email' }
    },
    password: { type: String, required: true, minlength: 5 },
    tokens: [{ access: { type: String, required: true }, token: { type: String, required: true } }],
    createdAt: Number,
    isDeleted: Boolean, default: false
});

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, '123', { expiresIn: 60 * 60 * 24 }).toString();
    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, '123');
    } catch (e) {
        return Promise.reject(e);
    }

    return User.findOne(
        {
            _id: decoded._id,
            'tokens.token': token,
            'tokens.access': 'auth'
        });
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise(
            (resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject();
                    }
                });
            });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;

    // get the current date
    var currentDate = new Date().getTime();
    // if created_at doesn't exist, add to that field
    if (!user.createdAt) {
        user.createdAt = currentDate;
    }

    else {
        user.updatedAt = currentDate;
    }


    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};



var User = mongoose.model('User', UserSchema);
module.exports = { User }