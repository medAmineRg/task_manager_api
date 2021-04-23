const jwt = require('jsonwebtoken'),
    User = require('../models/user');
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token });
        if (!user) {
            throw new Error()
        }
        req.token = token;
        req.user = user;
        next()
    } catch (e) {
        return res.status(400).send({ error: "invalid token" })
    }
}

module.exports = auth;