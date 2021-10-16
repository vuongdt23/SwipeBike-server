const express = require ('express');
const AuthRouter = require('./routers/AuthRouter')
const app = express ();

app.use (express.json ());
app.use (express.urlencoded ({extended: true}));

app.use ('/auth', AuthRouter);

app.listen (3001);
