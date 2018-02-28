
const _ = require('lodash');

var { authenticate } = require('../middleware/authenticate');
var { ObjectID } = require('mongodb');


module.exports = (router, Comment) => {
    router.route('/comments')
        .post(authenticate, (req, res) => {

            var comment = new Comment({
                _post: req.body._post,
                text: req.body.text,
                _creator: req.user._id,
                _parentcomment: req.body._parentcomment //parent comment
            });

            comment.save()
                .then((comment) => {
                    res.status(200).json({ success: true, comment });
                }).catch((e) => {
                    res.status(400).send({ error: e.toString() });
                });
        })

        .get((req, res) => {
            Comment.find({}).select({ '_id': 1, 'text': 1, 'isDeleted': 1, 'createdAt': 1, 'updatedAt': 1 })
                .populate({
                    path: '_creator',
                    select: { '_id': 1 }
                })
                .populate({
                    path: '_post',
                    select: { '_id': 1, '_creator': 1 },
                    populate: {
                        path: '_creator',
                        select: { '_id': 1, 'text': 1 },
                        model: 'User'
                    }
                })
                .populate({
                    path: '_parentcomment',
                    select: { '_id': 1 },
                    populate: {
                        path: '_creator',
                        select: { '_id': 1 },
                        model: 'User'
                    }
                })
                .then((comments) => {
                    res.send({ comments });
                }, (e) => {
                    res.status(400).send(e.toString());
                });
        });

    router.route('/comments/:id')
        .patch(authenticate, (req, res) => {
            var id = req.params.id;
            var body = _.pick(req.body, ['text', 'isDeleted']);

            if (!ObjectID.isValid(id)) {
                return res.status(404).send('Error 404');
            }

            body.updatedAt = new Date().getTime();
            Comment.findOneAndUpdate({
                _id: id,
                _creator: req.user._id
            }, { $set: body }, { new: true }).then((comment) => {
                if (!comment) {
                    return res.status(404).send();
                }
                res.send({ comment });
            }).catch((e) => {
                res.status.send(e);
            });
        });

    router.route('/postcomments/:id')
        .get((req, res) => {
            var id = req.params.id;
            Comment.find({ _post: id }).select({ '_id': 1, 'text': 1, 'isDeleted': 1, 'createdAt': 1, 'updatedAt': 1 })
                .populate({
                    path: '_creator',
                    select: { '_id': 1 }
                })
                .populate({
                    path: '_post',
                    select: { '_id': 1, '_creator': 1 },
                    populate: {
                        path: '_creator',
                        select: { '_id': 1, 'text': 1 },
                        model: 'User'
                    }
                })
                .populate({
                    path: '_parentcomment',
                    select: { '_id': 1 },
                    populate: {
                        path: '_creator',
                        select: { '_id': 1 },
                        model: 'User'
                    }
                })
                .then((comments) => {
                    res.send({ comments });
                }, (e) => {
                    res.status(400).send(e.toString());
                });
        });
    router.route('/me/comments')
        .get(authenticate, (req, res) => {
            Comment.find({ _creator: req.user._id }).then((comments) => {
                res.send({ comments });
            }, (e) => {
                res.status(400).send(e);
            });
        });

};