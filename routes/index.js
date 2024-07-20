const express = require('express');
const ssh2 = require('ssh2');
var router = express.Router();


router.get('/', (req, res) => {
  res.render('index', { error: '' });
});

router.post('/connect', (req, res) => {
  const { ipaddress, username, password } = req.body;
  if (!ipaddress || !username || !password) {
    return res.render('index', { error: 'Please fill in all fields.' });
  }

  const connection = new ssh2.Client();

  connection.on('ready', () => {
    connection.exec('echo "hello user"', (err, stream) => {
      if (err) {
        console.error(err);
        return res.render('index', { error: 'Command execution failed: ' + err.message });
      }
      
      stream.on('close', (code, signal) => {
        connection.end();
        res.send('Connected successfully and message sent!');
      }).on('data', (data) => {
        console.log('OUTPUT: ' + data);
      }).stderr.on('data', (data) => {
        console.error('STDERR: ' + data);
      });
    });
  });

  connection.on('error', (err) => {
    console.error(err);
    res.render('index', { error: 'Connection failed: ' + err.message });
  });

  connection.connect({
    host: ipaddress,
    username: username,
    password: password, 
  });
});


module.exports=router;