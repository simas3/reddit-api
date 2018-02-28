const _ = require('lodash');
var { authenticate } = require('../middleware/authenticate');
var { ObjectID } = require('mongodb');

module.exports = function (router, User) {
    router.route('/users/login')
        // create users (accessed at POST http://localhost:3000/api/users)
        //EXAMPLE:
        //{"email" : "simas@gmail.com", "password" : "123456"}
        .post((req, res) => {
            var body = _.pick(req.body, ['email', 'password']);
            User.findByCredentials(body.email, body.password).then((user) => {
                return user.generateAuthToken().then((token) => {
                    console.log('USER LOGGED IN: ' + user.usernaname);
                    res.header('x-auth', token).send({ user, token });
                });
            }).catch((e) => {
                console.log('ERROR CREATING USER: ' + err);
                res.status(400).send({ error: e });
            });
        });

    router.route('/users/')

        .post((req, res) => {
            var body = _.pick(req.body, ['username', 'email', 'password']);
            body.createdAt = new Date().getTime();
            var user = new User(body);

            user.save().then(() => {
                return user.generateAuthToken();
            }).then((token) => {
                console.log('USER CREATED: ' + user.username);
                res.header('x-auth', token).send({ user, token });
            }).catch((e) => {
                console.log('ERROR CREATING USER: ' + e);
                res.status(400).send({ error: e });
            });
        });


    router.route('/users/me')
        .get(authenticate, (req, res) => {
            res.json(req.user);
        });

    router.route('/users/me/token')
        .delete(authenticate, (req, res) => {
            req.user.removeToken(req.token).then(() => {
                console.log('USER TOKEN DELETED');
                res.status(200).send();
            },
                (e) => {
                    console.log('USER TOKEN ERROR');
                    res.status(400).send({ error: e });
                });
        });
};