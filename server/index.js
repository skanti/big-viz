const env = require('dotenv-safe').config({path : "./.env", example : "./.env.example"});
require('dotenv-expand')(env)
global.__basedir = __dirname;

const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const math = require('mathjs');
const io = require('socket.io');


const axios = require("axios");
axios.defaults.baseURL = process.env.URL_SERVER;

const router = express.Router();

let db = null;
let collection = null;
let collection_history = null;


const app = express();
app.use(bodyParser.json());
app.use(cors());

// -> some extra services
router.get("/", function(req, res, next) {
  res.send("alive");
});

router.get("/timestamp", function(req, res, next) {
  const timestamp = (new Date()).toString();
  res.send(timestamp);
});

// -> data serving api
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
})

function search_and_find_file(filename) {
  return new Promise((resolve, reject) => {
    let file = path.join(__dirname, "/static/home/", filename);
    if (fs.existsSync(file))
      resolve(file)
    else
      reject(new Error("No file found"));
  });
}

router.get("/data/*", function(req, res, next) {
  const filename = req.params["0"];
  search_and_find_file(filename).then(file => {
    res.sendFile(file)
  }).catch(err => {
    res.status(500).send({ msg: err.message })
  });
});
// <-

app.use("/", router);
module.exports = router;

const hostname = process.env.HOSTNAME_SERVER;
const port = process.env.PORT_SERVER;
const url = process.env.URL_SERVER;

const handle = http.createServer(app);

handle.listen({"port" : port, "host" : hostname}, () => {
  console.log(`Server running at ${url}`);
});

let ws_handle = io(process.env.PORT_WEBSOCKET, { origins: '*:*'});
ws_handle.on('connection', socket => {
  console.log(`A user connected with socket id ${socket.id}`)

  socket.emit('user', socket.id)

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id)
  })

  socket.on('nudge-client', data => {
    socket.broadcast.to(data.to).emit('client-nudged', data)
  })

  socket.on('data', data => {
    data = decodeURIComponent(escape(data));
    socket.emit("ok");
    socket.broadcast.emit("data", data);
  })
})

