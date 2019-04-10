const express = require('express');
const app = express();
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');
require('./db/mongoose');
const port = process.env.PORT;
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.listen(port, () => {
    console.log("Server is up on port " + port);
});
