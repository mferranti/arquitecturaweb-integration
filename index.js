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

let chatApps = new Map([
  ['grails', {
    "endpointPublic":"https://arq-chat.herokuapp.com/integrate/public",
    "endpointPrivate":"https://arq-chat.herokuapp.com/integrate/private",
    "endpointContacts":"https://arq-chat.herokuapp.com/show/users"
  }],
  ['AngularJSChatApp', {
    "endpointPublic":"https://quiet-citadel-52217.herokuapp.com/publicChat",
    "endpointPrivate":"https://quiet-citadel-52217.herokuapp.com/privateChat",
    "endpointContacts":"https://quiet-citadel-52217.herokuapp.com/contacts"
  }]
])

let logMessages = [];
logMessage = (message) => {
  logMessages = [message, ...logMessages].splice(0, 100)
}

let logArrivalMessages = [];
logArrivalMessage = (message) => {
  logArrivalMessages = [message, ...logArrivalMessages].splice(0, 100)
}

const sendMessage = async (message, endpoint) => superagent.post(endpoint)
  .send(message)
  .set('accept', 'json')

const fetchContacts = async (appId) => (await superagent.get(chatApps.get(appId).endpointContacts)).body

function response(res, statusCode, value) {
  res.status(statusCode);
  res.json(value);
}

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
  response(res, 200, { msg:`App ${req.body.id} integrated successfully integrated` });
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
  
  logArrivalMessage(message)

  for ([key, chatApp] of chatApps) {
    if (key !== sourceApp) {
      await sendMessage(message, chatApp.endpointPublic)
    }
  }
  logMessage(message)
  response(res, 200, { msg: 'Broadcast message sent succesfully' })
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
  
  logArrivalMessage(message)
  await sendMessage(message, chatApps.get(targetApp).endpointPrivate)
  logMessage(message)
  response(res, 200, { msg: 'Broadcast message sent succesfully' });
}))
app.get('/contacts', checkError(async (req, res) => {
  const contacts = await Promise.all(
    [...chatApps.keys()].map(async id => ({id, contacts: await fetchContacts(id)}))
  )
  response(res, 200, contacts)
}))
app.get('/ctest', checkError((req, res) => {
  const contacts = [
    {id: '1', name: 'username'},
    {id: '2', name: 'otrouser'},
    {id: '3', name: 'me'},
  ]
  response(res, 200, contacts)
}))
app.get('/log', checkError((req, res) => {
  response(res, 200, logMessages)
}))

app.get('/logArrival', checkError((req, res) => {
  response(res, 200, logArrivalMessages)
}))
app.post('/test', checkError((req, res) => {
  console.log('message arrived from: ', req.body )
  response(res, 200, {...req.body})
}))

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
