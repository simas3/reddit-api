const _ = require('lodash');

var { authenticate } = require('../middleware/authenticate');
var { ObjectID } = require('mongodb');

module.exports = (router, Post) => {
    router.route('/posts')
        .post(authenticate, (req, res) => {
            var post = new Post({
                title: req.body.title,
                content: req.body.content,
                _creator: req.user._id
            });

            post.save().then((post) => {
                res.send({ post });
            }, (e) => {
                res.status(400).send({ error: e });
            });
        })

        .get((req, res) => {
            Post.find({}).populate({
                path: '_creator'
            }).then((posts) => {
                res.send({ posts });
            }, (e) => {
                res.status(400).send(e);
            });
        });

    router.route('/posts/:id')
        .get((req, res) => {
            var id = req.params.id;
            if (!ObjectID.isValid(id)) {
                return res.status(404).send('Error 404');
            }
            Post.findOne({ _id: id }).then((post) => {
                if (!post) {
                    return res.status(404).send('Post not found');
                }
                res.status(200).send({ post });
            }).catch((err) => {
                res.status(400).send(err);
            });
        })

        .delete(authenticate, (req, res) => {
            var id = req.params.id;

            if (!ObjectID.isValid(id)) {
                return res.status(404).send('Error 404');
            }

            Post.findOneAndRemove({
                _id: id,
                _creator: req.user._id
            }).then((post) => {
                if (!post) {
                    return res.status(404).send('Post not found');
                }
                res.status(200).send({ post });
            }).catch((err) => {
                res.status(400).send();
            });
        })

        .patch(authenticate, (req, res) => {
            var id = req.params.id;
            var body = _.pick(req.body, ['title', 'content', 'isDeleted']);

            if (!ObjectID.isValid(id)) {
                return res.status(404).send('Error 404');
            }


            body.updatedAt = new Date().getTime();
            Post.findOneAndUpdate({
                _id: id,
                _creator: req.user._id
            }, { $set: body }, { new: true }).then((post) => {
                if (!post) {
                    return res.status(404).send();
                }
                res.send({ post });
            }).catch((e) => {
                res.status.send(e);
            });
        });

    // router.route('/upvote/:id')
    //     .patch(authenticate, (req, res) => {
    //         var id = req.params.id;
    //         var body = _.pick(req.body, ['upvotes']);
    //         console.log(body);
    //         if (!ObjectID.isValid(id)) {
    //             return res.status(404).send('Error 404');
    //         }

    //         if (body.upvotes === 1 || body.upvotes === -1) {

    //             Post.findOneAndUpdate({
    //                 _id: id
    //             }, { $inc: { upvotes: body.upvotes } }, { new: true }).then((post) => {
    //                 if (!post) {
    //                     return res.status(404).send();
    //                 }
    //                 res.send({ post });
    //             }).catch((e) => {
    //                 res.status.send(e);
    //             });
    //         } else {
    //             return res.status(404).send(JSON.stringify('Error 404'));
    //         }
    //     });


    router.route('/me/posts')
        .get(authenticate, (req, res) => {
            Post.find({ _creator: req.user._id }).then((posts) => {
                res.send({ posts });
            }, (e) => {
                res.status(400).send(e);
            });
        });
};