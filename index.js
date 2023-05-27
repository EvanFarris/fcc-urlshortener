require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require(`dns`);
let bodyParser = require(`body-parser`);
let OTSmap = new Map();
let STOmap = new Map();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.use(bodyParser.urlencoded({extended: false}));

app.post(`/api/shorturl`, function(req,res){
  let originalURL = req.body.url;
  const regex = /^https?:\/\//i;
  const regex2 = /\/\?.*$/;
  //originalURL = originalURL;
  let hostName = originalURL.replace(regex,``).replace(regex2,``);
  

  dns.lookup(hostName, function(err,address){
    if(err){

      res.json({"error": "invalid url"});
    } else {
      let shortenedURL = OTSmap.get(originalURL);
      if(!shortenedURL) {
        OTSmap.set(originalURL, (OTSmap.size + 1));
        STOmap.set(OTSmap.size, originalURL);
        shortenedURL=STOmap.size;
      }

      res.json({original_url: originalURL, short_url: shortenedURL});
    }
  });
});

app.get(`/api/shorturl/:number`, function(req,res) {
  let num = parseInt(req.params.number);

  if(num <= STOmap.size){

    res.status(301).redirect(STOmap.get(num));
  } else {
    res.json({"error": "No short URL found for the given input"});
  }
  
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
