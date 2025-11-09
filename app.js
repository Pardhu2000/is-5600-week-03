const http = require('http');
const url = require('url');
const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();
const EventEmitter = require('events');



const chatEmitter = new EventEmitter();
const clients = []; // Store connected clients
const messages = []; // Store chat messages
app.use(express.static(__dirname + '/public'));
/**
 * Responds with plain text
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondText(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('hi');
  }

  /**
   * Responds with JSON
   * 
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function respondJson(req, res) {
    res.json({
      text: 'hi',
      numbers: [1, 2, 3],
    });
  }
  /**
 * Responds with the input string in various formats
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  // here we make use of res.json to send a json response with less code
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

  /**
 * Responds with a 404 not found
 * 
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondNotFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

app.use(express.static('public'));

function respondChat (req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}

/** 
* @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/sse', respondSSE);

function respondSSE (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/', chatApp);
app.get('/chat', respondChat);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

