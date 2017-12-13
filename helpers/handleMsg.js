var callSendAPI = require('./sendAPI');
// Handles messages events
module.exports = function (sender_psid, received_message) {
    let response;
    
      // Check if the message contains text
      if (received_message.text) {    
    
        // Create the payload for a basic text message
        response = {
          "text": `You sent the message: "${received_message.text}". Now send me an image!`
        }
      }  
      
      // Sends the response message
      callSendAPI(sender_psid, response);  
}