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
const ws = require('ws');

const axios = require("axios");
axios.defaults.baseURL = process.env.URL_SERVER;

const router = express.Router();

let db = null;
let collection = null;
let collection_history = null;


const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

function get_folderlist(folder) {
  const is_dir = source => fs.lstatSync(source).isDirectory();
  const get_directories = (source) => fs.readdirSync(source).map(name => path.join(source, name)).filter(is_dir);
  let list = get_directories(path.join(__dirname, "/static/data/", folder));

  return list.map(x => path.basename(x));
}

// -> some extra services
router.get("/timestamp", function(req, res, next) {
  const timestamp = (new Date()).toString();
  res.send(timestamp);
});

// -> data serving api
router.get("/data/get_sequence_list", function(req, res, next) {
  const is_dir = source => fs.lstatSync(source).isDirectory();
  const get_files = (source) => fs.readdirSync(source).map(name => path.join(source, name)).filter(is_dir);

  const sequences_all = get_files(path.join(__dirname, "/static/waymo-open-dataset-pb/"));
  const sequences_all_clean = sequences_all.map(x => path.basename(x));
  res.send(sequences_all_clean)
});

router.get("/data/get_frame_list", function(req, res, next) {
  const id_sequence = req.query.id_sequence;
  const get_files = (source) => fs.readdirSync(source).map(name => path.join(source, name));

  const frames_all = get_files(path.join(__dirname, "/static/waymo-open-dataset-pb/", id_sequence));
  const frames_all_clean = frames_all.map(x => path.basename(x, ".pb"));
  res.send(frames_all_clean)
});

router.get("/data/get_frame/:id_sequence&:id_frame", function(req, res, next) {
  const id_sequence = req.params.id_sequence;
  const id_frame = req.params.id_frame;

  const filename_pb = path.join(__dirname, "/static/waymo-open-dataset-pb/", id_sequence, id_frame + ".pb");
  if (fs.existsSync(filename_pb))
    res.sendFile(filename_pb);
  else
    res.status(500).send("No data found");
});

router.get("/data/get_car_list", function(req, res, next) {
  const is_png = source => path.extname(source) === ".png";
  const get_files = (source) => fs.readdirSync(source).map(name => path.join(source, name)).filter(is_png);

  const cars_all = get_files(path.join(__dirname, "/static/car-models/"));
  const cars_all_clean = cars_all.map(x => path.basename(x, ".png"));
  res.send(cars_all_clean)
});

router.get("/data/get_car/img/:id_car", function(req, res, next) {
  const id_car = req.params.id_car;

  const filename_img = path.join(__dirname, "/static/car-models/", id_car + ".png");
  if (fs.existsSync(filename_img))
    res.sendFile(filename_img);
  else
    res.status(500).send("No data found");
});

router.get("/data/get_car/cad/:id_car", function(req, res, next) {
  const id_car = req.params.id_car;

  const filename_img = path.join(__dirname, "/static/car-models/", id_car + ".ply");
  if (fs.existsSync(filename_img))
    res.sendFile(filename_img);
  else
    res.status(500).send("No data found");
});
// <-

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

let ws_handle = new ws.Server({port: process.env.PORT_WEBSOCKET, 'Access-Control-Allow-Origin': "*"});
ws_handle.on('connection', ws => {
  ws.on('message', msg => {
    console.log(`Received message: ${msg}`)
  })
});
