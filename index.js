const express = require('express')
const bodyParser = require('body-parser')
const superagent = require('superagent')

const app = express()

function checkError(routeHandler) {
  return async (req, res, next) => {
    try {
      await routeHandler(req, res, next)
    } catch (err) {
      res.send({
        status: err.status,
        msg: err.message,
      })
      next(err)
    }
  }
}

const sendMessage = async (message, endpoint) => superagent.post(endpoint)
  .send(message)
  .set('accept', 'json')

let chatApps = new Map;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', (req, res) => res.sendFile(`${__dirname}/README.md`))
app.get('/apps', (req, res) =>
  res.send({
    status: 200,
    msg: Array.from(chatApps)
  })
)
app.post('/integrate', checkError((req, res) => {
  const { id, endpointPublic, endpointPrivate, endpointContacts } = req.body;
  chatApps.set(id, { endpointPublic, endpointPrivate, endpointContacts });
  res.send({
    status: 200,
    msg: `App ${req.body.id} integrated successfully integrated`,
  })
}))
app.post('/public/send', checkError(async (req, res) => {
  const { from, msg, to, attachment, sourceApp } = req.body;
  // some validator for message?
  const message = {
    from,
    msg,
    to,
    attachment,
    sourceApp,
  };
  for ([key, chatApp] of chatApps) {
    if (key !== sourceApp) {
      await sendMessage(message, chatApp.endpointPublic)
    }
  }
  res.send({status: 200, msg: 'Broadcast message sent succesfully'});
}))
app.post('/private/send', checkError(async (req, res) => {
  const { from, msg, to, attachment, sourceApp, targetApp } = req.body;
  // some validator for message?
  const message = {
    from,
    msg,
    to,
    attachment,
    sourceApp,
  };
  await sendMessage(message, chatApps.get(targetApp).endpointPrivate)
  res.send({status: 200, msg: 'Broadcast message sent succesfully'});
}))

app.post('/test', checkError((req, res) => {
  console.log('message arrived from: ', req.body )
  res.send({...req.body})
}))

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
