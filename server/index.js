const env = require('dotenv-safe').config({path : './.env', example : './.env.example'});
require('dotenv-expand').expand(env);

const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const io = require('socket.io');
const history = require('connect-history-api-fallback');


const axios = require('axios');
axios.defaults.baseURL = process.env.URL_SERVER;

const router = express.Router();

let db = null;
let collection = null;
let collection_history = null;


// -> app
const app = express();
app.use(bodyParser.json());
app.use(cors());
// <-

// -> vue
const middleware_static = express.static('../client/dist');
app.use(middleware_static);
app.use(history({ }));
app.use(middleware_static);
// <-

// -> auth middlelayer (if required)
function authenticate_jwt(req, res, next) {
  const access_token = req.headers["x-access-token"];
  if (!access_token)
    return res.sendStatus(401);

  jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
    if (err)
      return res.sendStatus(403);
    req.user = data.user;
    next();
  })
};
// <-


// -> some extra services
router.get('/', function(req, res, next) {
  res.send('alive');
});

router.get('/timestamp', function(req, res, next) {
  const timestamp = (new Date()).toString();
  res.send(timestamp);
});

function search_and_find_file(filename) {
  return new Promise((resolve, reject) => {
    let file = path.join(__dirname, '/static/home/', filename);
    if (fs.existsSync(file))
      resolve(file)
    else
      reject(new Error('No file found'));
  });
}

router.get('/data/*', function(req, res, next) {
  const filename = req.params['0'];
  search_and_find_file(filename).then(file => {
    res.sendFile(file)
  }).catch(err => {
    res.status(500).send({ msg: err.message })
  });
});
// <-

app.use('/', router);
module.exports = router;

const hostname = process.env.SERVER_HOSTNAME;
const port = process.env.SERVER_PORT;
const url = process.env.SERVER_URL;

const server = http.createServer(app);

server.listen({'port' : port }, () => {
  console.log(`Server running at ${url}`);


  let ws_handle = io(server, { cors: { origin: '*', }, maxHttpBufferSize: 1e9,
    timeout: 120*1000 });

  ws_handle.on('connection', socket => {
    const timestamp = new Date();
    console.log(`New user connected, socket_id=${socket.id}, timestamp=${timestamp}`)

    socket.emit('user', socket.id)

    socket.on('disconnect', () => {
      socket.broadcast.emit('user-disconnected', socket.id)
    })

    socket.on('ping', (data, callback) => {
      console.log("ping")
      socket.emit('ping', socket.id)
    })

    socket.on('upsert', (data, callback) => {
      console.log("receiving data");
      data = decodeURIComponent(escape(data));
      socket.broadcast.emit('upsert', data);
      callback({'status': 'ok'});
    })

    socket.on('update', (data, callback) => {
      data = decodeURIComponent(escape(data));
      socket.emit('ok');
      callback({'status': 'ok'});
    })
  })

});
