import io from 'socket.io-client';

//const options = {};

let uri_ws = 'http://localhost:' + process.env.VUE_APP_PORT_WEBSOCKET;
const ws = io(uri_ws);

export default ws;
