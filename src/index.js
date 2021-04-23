const Task = require('./models/task');
const User = require('./models/user');

require('./db/mongoose')
const express = require('express'),
    app = express(),
    userRouter = require('./routers/user'),
    taskRouter = require('./routers/task'),
    port = process.env.PORT;


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('server is up and running on ' + port);
})


// const main = async () => {
//     // const task = await Task.findById('607abd25d20ecf4c68b60a33')
//     // await task.populate('owner').execPopulate()
//     // console.log(task);
//     const user = await User.findById('607abd21d20ecf4c68b60a31')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);
// }

// main()
