import mongoose from 'mongoose'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import bodyParser from 'body-parser'
require('dotenv').config()

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

const app = express()
app.use(helmet())
app.use(compression())
app.use(
  cors({
    optionsSuccessStatus: 200
  })
)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = http.createServer(app)
server.listen(process.env.PORT, () => {
  console.info('APPLICATION STARTED ON PORT => ', process.env.PORT)
})

export default server
