const express = require('express');
const env = process.env;
const app = express();
const port =  env.PORT || 3000;


app.get('/', (req, res) => {
    res.send("holaa");
});

app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log("Server listening on http://localhost:" + port);
});