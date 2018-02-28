const _ = require('lodash');
var mongoose = require('mongoose');
var { authenticate } = require('../middleware/authenticate');
var { ObjectId } = require('mongodb');

module.exports = (router, Vote) => {
    router.route('/vote')
        .post(authenticate, (req, res) => {
            var vote = new Vote({
                _comment: req.body._comment,
                _post: req.body._post,
                amount: req.body.amount,
                _voter: req.user._id
            });

            vote.save().then((vote) => {
                res.send({ vote });
            }, (e) => {
                res.status(400).send({ error: e });
            });
        });

    router.route('/vote/:id')
        .get((req, res) => {
            id = req.params.id;
            Vote.find({ $or: [{ _post: id }, { _comment: id }] })
                .then((votes) => {
                    res.send({ votes });
                }, (e) => {
                    res.status(400).send(e);
                });

        })

        .delete(authenticate, (req, res) => {
            id = req.params.id;
            Vote.findOneAndRemove({ $or: [{ _post: id }, { _comment: id }], _voter: req.user._id })
                .then((vote) => {
                    res.send({ vote });
                }, (e) => {
                    res.status(400).send(e);
                });
        })
};