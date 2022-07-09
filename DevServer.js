const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs')

app.get('/wheel', (req, res) => {
    res.sendfile(  './src/web-interface/wheel.html');
});

app.get('/settings', (req, res) => {
    res.sendfile(  './src/web-interface/settings.html');
});

app.get('/', (req, res) => {
    res.sendfile(  './src/web-interface/presets.html');
});

app.get('/connect', (req, res) => {
    res.sendfile('./src/web-interface/connect.html');
});

app.get('/toastify.js', (req, res) => {
    res.sendfile("./src/web-interface/toastify.js");
});


app.get('/env.js', (req, res) => {
  res.sendfile("./DevENV.js");
});

app.get('/iro.js', (req, res) => {
  res.sendfile("./src/web-interface/iro.js")
});

app.get('/wheel.js', (req, res) => {
  res.sendfile("./src/web-interface/wheel.js")
});

app.get('/settings.js', (req, res) => {
    res.sendfile("./src/web-interface/settings.js")
});

app.get('/presets.js', (req, res) => {
    res.sendfile("./src/web-interface/presets.js")
});

app.get('/rest.js', (req, res) => {
    res.sendfile("./src/web-interface/rest.js")
});

app.get('/ee3.js', (req, res) => {
  res.sendfile("./src/web-interface/ee3.js")
});

app.get('/toastify.css', (req, res) => {
    res.sendfile("./src/web-interface/toastify.css")
});


app.get('/style.css', (req, res) => {
    res.sendfile("./src/web-interface/style.css")
});

app.get('/skeleton.css', (req, res) => {
    res.sendfile("./src/web-interface/skeleton.css")
});

app.get('/normalize.css', (req, res) => {
    res.sendfile("./src/web-interface/normalize.css")
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});


