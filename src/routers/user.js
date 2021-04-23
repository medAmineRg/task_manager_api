const express = require('express'),
    router = new express.Router(),
    sharp = require('sharp'),
    auth = require('../middleware/auth'),
    multer = require('multer'),
    { sendWelcomeEmail, sendCancelEmail } = require('../email/sendGrid'),
    User = require('../models/user');

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/user/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.genereteAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.genereteAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

let upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)/)) {
            return cb(new Error("You must provide only a png or or jpeg file!"))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 300, height: 300 }).toBuffer()
    req.user.avatar = buffer;
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }



})


router.patch('/users/me', auth, async (req, res) => {
    const availableUpdates = ["email", "name", "age", "password"]
    const reqKeys = Object.keys(req.body)
    const bol = reqKeys.every(key => availableUpdates.includes(key))
    if (!bol) {
        return res.status(500).send({ 'reason': 'You cant update that' })
    }
    try {
        // const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const updateUser = req.user;
        reqKeys.forEach(update => updateUser[update] = req.body[update])
        await updateUser.save()
        res.send(updateUser)
    } catch (e) {
        return res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        sendCancelEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router;