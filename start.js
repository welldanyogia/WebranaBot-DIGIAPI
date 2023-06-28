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

function verifySignature(secret, signature, payload) {
  const hmac = crypto.createHmac('sha1', secret);
  const digest = 'sha1=' + hmac.update(payload).digest('hex');
  return signature === digest;
}

app.post('/webhook', (req, res) => {
  const event = req.headers['x-digiflazz-event'];
  const signature = req.headers['x-hub-signature'];

  if (event === 'ping') {
    // Event ping, webhook berhasil di-setup
    console.log('Webhook berhasil di-setup');
    return res.sendStatus(200);
  }

  // Verifikasi tanda tangan HMAC jika webhook menggunakan secret
  const secret = 'somesecretvalue';
  if (secret && !verifySignature(secret, signature, JSON.stringify(req.body))) {
    console.log('Tanda tangan tidak valid');
    return res.sendStatus(403);
  }

  // Proses event transaksi
  if (event === 'create' || event === 'update') {
    const payload = req.body.data;
    // Lakukan pemrosesan data transaksi di sini
    console.log('Event transaksi:', event);
    console.log('Payload:', payload);

    // Kirim konten webhook ke WhatsApp menggunakan Twilio
    // const phoneNumber = 'whatsapp:+1234567890'; // Nomor telepon penerima WhatsApp
    // const messageContent = JSON.stringify(payload); // Konten webhook yang akan dikirim
    // sendWhatsAppMessage(phoneNumber, messageContent);

    // Kirim respon sukses
    return res.json({ status: 'success' });
  }

  // Event tidak dikenali
  console.log('Event tidak dikenali');
  return res.sendStatus(400);
});

app.get('/webhook', (req, res) => {
  return res.status(200).json({ message: 'GET request ke /webhook berhasil' });
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("WEBRANA Server is Active in Port: " + PORT);
});
