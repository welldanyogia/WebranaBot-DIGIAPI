//WEB SERVER
let { startSock } = require("./index.js")
const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")
const fs = require('fs')
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const secret = 'somesecretvalue';
  const payload = JSON.stringify(req.body);
  const signature = crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex');

  console.log(signature);

  if (req.headers['x-hub-signature'] === `sha1=${signature}`) {
    console.log(req.body);
  }

  res.sendStatus(200);
});



app.get('/gambar', (req, res) => {
  const path = __dirname + '/img.png';
  const path2 = __dirname + '/done.jpg';
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (fs.existsSync('./img.png')) {
    res.sendFile(path, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {
    res.sendFile(path2, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  }
});

app.get("/", (req, res) => {
  if (fs.existsSync('./img.png')) {
    res.sendFile(__dirname + '/qr.html')
  } else {
    res.sendFile(__dirname + '/webrana.html')
  }

});

app.get('/ping', function(req, res) {
  const ipAddress = req.socket.remoteAddress;
  res.send(ipAddress);
});


app.get("/restart", (req, res) => {
  try {
    res.sendFile(__dirname + '/ping.html')
  } finally {
    var sys = require('sys')
    var exec = require('child_process').exec;

    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("kill 1", function(err, stdout, stderr) {
      console.log(stdout);
    })
  }
})

app.get("/del", (req, res) => {
  if (fs.existsSync('./multi_state/store.json')) {
    fs.unlinkSync('./multi_state/store.json')
  }

  res.sendFile(__dirname + '/ping.html')

})

startSock()

const PORT = process.env.PORT || 1232;

app.listen(PORT, () => {
  console.log("WEBRANA Server is Active in Port: " + PORT);
});
