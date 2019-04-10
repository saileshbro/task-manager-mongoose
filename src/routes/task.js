const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0 
// Limit skip for pagination
// sort data in specific order
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const queryParams = {};//sending the response depending on the query parameters
    if (req.query.completed) {
        queryParams.completed = req.query.completed === 'true';
    }
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip);
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    try {
        const tasks = await Task.find({
            owner: req.user._id,
            ...queryParams
        }).limit(limit).skip(skip).sort({
            ...sort
        });
        if (!tasks) res.status(404).send();
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});
router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedUpadtes = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValid = updates.every(update => allowedUpadtes.includes(update));
    if (!isValid) {
        return res.status(400).send({
            error: "Invalid updates!"
        });
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach(update => {
            task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;