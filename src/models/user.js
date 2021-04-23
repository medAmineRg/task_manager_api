const mongoose = require('mongoose'),
    validator = require('validator'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    Task = require('./task');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw 'Email is invalid!'
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: [6, 'to low, more than 5 charachter'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw 'thats not actually a password!'
            }

        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw 'You serious !'
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

},
    { timestamps: true })

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this;
    const object = user.toObject()
    delete object.tokens;
    delete object.password;
    delete object.avatar;
    return object
}

// instances method

userSchema.methods.genereteAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)
    user.tokens = user.tokens.concat({ token: token })
    await user.save()
    return token
}

// statics function

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw 'Email Not found!'
    }
    const result = await bcrypt.compare(password, user.password)
    if (!result) {
        throw 'Email or password maight be wrong!'
    }
    return user
}

// hash password
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
})

// 
userSchema.pre('remove', async function (next) {

    const user = this;
    await Task.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User;