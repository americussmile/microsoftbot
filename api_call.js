var header = {'Content-Type':'application/json', 
'Ocp-Apim-Subscription-Key':'f149237a-56ea-41f9-ba5c-28b39fc5af43'}

function sendGetSentimentRequest(message) {      
    var options = {        
       method: 'POST',        
       uri:
 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';,        
       body: {            
          documents:[{id:'1', language: 'en', text:message}]  
       },        
       json: true, // Automatically stringifies the body to JSON
       headers: header    
    };    
    return rp(options)
 ;}
 function getGiphy(searchString) {    
    var options = {        
       method: 'GET',        
       uri: 'https://api.giphy.com/v1/gifs/translate',        
       qs: {            
          s: searchString,            
          api_key: '9n8AIaWULVu37sA1k8eE38IwnCCjmXP9'        
       }    
    }    
    return rp(options)
 ;}

 // Bot introduces itself and says hello upon conversation start
bot.on('conversationUpdate', function (message) {    
    if (message.membersAdded[0].id === message.address.bot.id) {             
          var reply = new builder.Message()    
                .address(message.address)    
                .text("Hello, I'm careBOTyou! How's your day going?");        
          bot.send(reply);    
    }
 }); 
 bot.dialog('/', function(session) {        
    sendGetSentimentRequest(session.message.text).then(function (parsedBody) {            
       console.log(parsedBody);            
       var score = parsedBody.documents[0].score.toString(); 
       if(score > 0.80) {                    // happy  
            session.beginDialog("/happy");             
       } else if(score > 0.1) {             // stressed    
            session.beginDialog("/stressed");             
       } else {                             // crisis  
            session.beginDialog("/crisis");             
       }        
    })        
    .catch(function (err) {            
       console.log("POST FAILED: " + err);        
    });  
 });

 bot.dialog('/happy', [    
    function(session) {    
    builder.Prompts.text(session, "That's awesome! What would make you even happier?");    
    },    
    function(session, results) { 
         getGiphy(results.response).then(function(gif) {  
          // session.send(gif.toString());      
         console.log(JSON.parse(gif).data);   
         session.send({                
            text: "Here you go!",                
            attachments: [                    
               {                        
                  contentType: 'image/gif',     
                  contentUrl: 
                    JSON.parse(gif).data.images.original.url  
               }                
            ]            
         });        
    }).catch(function(err) {            
          console.log("Error getting giphy: " + err);  
          session.send({                
             text: "We couldn't find that unfortunately :(",
             attachments: [                    
               {                        
                  contentType: 'image/gif',  
                  contentUrl: 'https://media.giphy.com/media/ToMjGpt4q1nF76cJP9K/giphy.gif',  
                  name: 'Chicken nugz are life'   
               }                
             ]            
           });        
       }).then(function(idk) {     
          builder.Prompts.text(session, "Would you like to see more?");        
       });    
    },    
    function (session, results) {        
       if (results.response === "Yes" || results.response ===
       "yes") {            
         session.beginDialog('/giphy');        
       } else {            
         session.endDialog("Have a great rest of your day!!!");           
      }    
    }
 ]);
