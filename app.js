import mongoose from 'mongoose'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import bodyParser from 'body-parser'
require('dotenv').config()

// Database related
mongoose.Promise = global.Promise;
(async () => {
  await mongoose.connect(process.env.MONGODB)
})()
const db = mongoose.connection

db.on('error', err => {
  console.log('MONGOOSE ERR => ', err)
})

db.once('open', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.info('DB CONNECTED')
  }
})

process.on('SIGINT', () => {
  db.close(() => {
    process.exit(0)
  })
})
// EOF - Database related

const app = express()
app.set('view engine', 'ejs')
app.use(helmet())
app.use(compression())
app.use(
  cors({
    optionsSuccessStatus: 200
  })
)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const Pings = mongoose.model('pings', {
  name: String,
  url: String,
  interval: Number, // in minutes
  slack: String,
  enabled: Boolean
})

app.get('/', (req, res) => {
  var perPage = 9
  var page = req.params.page || 1

  Pings
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec(function (err, pings) {
    	console.log('PPP', pings)
      Pings.count().exec(function (err, count) {
        if (err) return next(err)
        res.render('pages/index', {
          pings,
          current: page,
          pages: Math.ceil(count / perPage)
        })
      })
    })
})

const server = http.createServer(app)
server.listen(process.env.PORT, () => {
  console.info('APPLICATION STARTED ON PORT => ', process.env.PORT)
})

export default server
