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
  console.log(chatApps);
  res.send({status: 200, msg: `App ${req.body.id} integrated successfully with endpoint: ${req.body.endpoint}`})
})
app.post('/send', async (req, res) => {
  const { from, msg, attachment, chat, to } = req.body;
  // some validator for message?
  const message = {
    from,
    msg,
    attachment,
    chat,
    to,
  };
  chatApps.forEach((chatApp, key) => {
    if (key !== chat) {
      const { endpoint, port } = chatApp;
      console.log(chatApp);
      superagent.post(chatApp.endpoint)
        .send(message)
        .set('accept', 'json')
        .end();
    }
  })

  res.send({status: 200, msg: 'Broadcast message sent succesfully'});
})

app.post('/test', (req, res) => {
  console.log('llego esto: ', req.body )
  res.send({...req.body})
})
app.listen(2345, () => console.log('Example app listening on port 2345!'))
