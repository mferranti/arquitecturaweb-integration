const express = require('express')
const bodyParser = require('body-parser')
const superagent = require('superagent')

const app = express()

let chatApps = new Map;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hola, como estas? áca podés integrar tu chat'))
app.post('/integrate', (req, res) => {
  const { id, endpoint, port } = req.body;
  chatApps.set(id, { endpoint, port })
  res.send({status: 200, msg: `App ${req.body.id} integrated successfully with endpoint: ${req.body.endpoint}`})
})
app.post('/send', async (req, res) => {
  const { from, msg, to, attachment, sourceApp, targetApp } = req.body;
  // some validator for message?
  const message = {
    from,
    msg,
    to,
    attachment,
    sourceApp,
    targetApp,
  };
  chatApps.forEach((chatApp, key) => {
    if (key !== sourceApp) {
      const { endpoint, port } = chatApp;
      superagent.post(chatApp.endpoint)
        .send(message)
        .set('accept', 'json')
        .end();
    }
  })

  res.send({status: 200, msg: 'Broadcast message sent succesfully'});
})

app.post('/test', (req, res) => {
  console.log('message arrived from: ', req.body )
  res.send({...req.body})
})

const port = process.env.NODE_ENV === 'production' ? 80 : 2345
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
