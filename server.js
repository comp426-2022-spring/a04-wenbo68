"use strict"
const db = require("./database.js")
const args = require("minimist")(process.argv.slice(2));
const express = require('express');
const { exit } = require("process");
const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      // secure: req.secure,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?,?,?,?,?,?,?,?,?,?)')
    const info = stmt.run(
      logdata.remoteaddr,
      logdata.remoteuser,
      logdata.time,
      logdata.method,
      logdata.url,
      logdata.protocol,
      logdata.httpversion,
      // logdata.secure,
      logdata.status,
      logdata.referer,
      logdata.useragent)
    res.status(200).json(info)
    next();
});

args["help"]
args["debug"]
args["log"]
args["port"]
const p = args.port || 5555

if(args.help==true){
  console.log("server.js [options]")
  console.log("--port  Set the port number for the server to listen on. Must be an integer between 1 and 65535.")
  console.log("--debug  If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message \"Error test successful.\" Defaults to `false`.")
  console.log("--log  If set to false, no log files are written. Defaults to true. Logs are always written to database.")
  console.log("--help  Return this message and exit.")
  exit(0);
}

const server = app.listen(p,() => {
    console.log('App is running on port: ' + p)
})

app.get('/app', (req,res,next) => {
    res.status(200).end("200 OK")
})

// only offer these endpoints if we are debugging
if(args.debug==true){
  app.get("/app/log/access", (req, res,next) => {
      // try {
      const stmt = db.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
      // } catch {
      //     console.error(e)
      // }
  })
  app.get('/app/error', (req, res,next) => {
    throw new Error('Error test successful') // Express will catch this on its own.
  })
}

app.get('/app/echo/:number',(req,res,next)=>{
    res.status(200).json({'message': req.params.number})
})

function coinFlip() {
    let x=Math.floor((Math.random() * 10) + 1);
    if(x<6){
      return "heads";
    }else{
      return "tails";
    }
  }

app.get('/app/flip',(req,res,next)=>{
    res.status(200).json({'flip':coinFlip()})
})

function coinFlips(flips) {
    const result=[];
    for(let i=0; i<flips; i++){
      result.push(coinFlip());
    }
    return result;
}
function countFlips(array) {
    let numHead=0;
    let numTail=0;
    for(let i=0;i<array.length;i++){
      if(array[i]=="heads"){
        numHead++;
      }else{
        numTail++;
      }
    }
    return {heads: numHead, tails: numTail};
}
// var arr = coinFlips(5);
// console.log(arr);
// console.log(countFlips(arr));

app.get('/app/flips/:number',(req,res,next) =>{
    var arr = coinFlips(req.params.number);
    var count = countFlips(arr);
    res.status(200).json({'raw':arr,'summary':count});
})

function flipACoin(call) {
    let result = '';
    let flip=coinFlip();
    if (call==flip){
      result='win';
    }else{
      result='lose';
    }
    return {call: call, flip: flip, result: result};
  }

app.get('/app/flip/call/:string',function (req,res,next){
    res.status(200).json(flipACoin(req.params.string));
})
app.use(function (req,res){
    res.type("text/plain")
    res.status(404).end("404 Not Found")
})