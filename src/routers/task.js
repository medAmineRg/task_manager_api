const User = require('../models/user'),
    auth = require('../middleware/auth')

const express = require('express'),
    router = new express.Router(),
    Task = require('../models/task');

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    console.log(sort);
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.patch('/tasks/:id', auth, async (req, res) => {
    const availableUpdates = ["description", "completed"]
    const reqKeys = Object.keys(req.body)
    const bol = reqKeys.every(key => availableUpdates.includes(key))
    if (!bol) {
        return res.send({ "error": "You cant update that" })
    }
    try {
        // const updateTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // const updateTask = await Task.findById(req.params.id);
        const updateTask = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!updateTask) {
            return res.status(404).send()
        }
        reqKeys.forEach(update => updateTask[update] = req.body[update])
        await updateTask.save()
        res.send(updateTask)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const deleteTask = await Task.findByIdAndDelete(req.params.id)
        const deleteTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!deleteTask) {
            return res.status(404).send()
        }

        res.send(deleteTask)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;