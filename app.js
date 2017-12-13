var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');

var handleMessage = require('./helpers/handleMsg'),
    handlePostback = require('./helpers/handlePostBack');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
  
  app.get('/', (req, res) => {
    res.status(200).json({msg: 'hello world'});
    console.log(process.env.PAGE_ACCESS_TOKEN + " " + typeof process.env.PAGE_ACCESS_TOKEN);
  });
  
  // Creates the endpoint for our webhook 
  app.post('/webhook', (req, res) => {  
    
     let body = req.body;
   
     // Checks this is an event from a page subscription
     if (body.object === 'page') {
   
       // Iterates over each entry - there may be multiple if batched
       body.entry.forEach(function(entry) {
   
         // Gets the message. entry.messaging is an array, but 
         // will only ever contain one message, so we get index 0
         let webhook_event = entry.messaging[0];
         console.log(webhook_event);

           // Get the sender PSID
          let sender_psid = webhook_event.sender.id;
          console.log('Sender PSID: ' + sender_psid);

           // Check if the event is a message or postback and
          // pass the event to the appropriate handler function
          if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);        
          } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
          }
  
       });
   
       // Returns a '200 OK' response to all requests
       res.status(200).send('EVENT_RECEIVED');
     } else {
       // Returns a '404 Not Found' if event is not from a page subscription
       res.sendStatus(404);
     }
   
   });
  
   app.get('/webhook', (req, res) => {
    
      // Your verify token. Should be a random string.
     
        
      // Parse the query params
      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];
        
      // Checks if a token and mode is in the query string of the request
      if (mode && token) {
      
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
          
          // Responds with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);      
        }
      }
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
