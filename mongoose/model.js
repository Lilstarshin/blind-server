const mongoose = require('mongoose')
require('dotenv').config()

const { DB_USER, DB_PASS } = process.env
const { log, error } = require('console')
const schema = require('./schema')

const db = mongoose.connection
const model = (() => {
  db.on('error', error)
  db.on('open', () => {
    log('Connecting mongodb!')
  })

  // 몽고디비 앱 엑세스 주소
  mongoose.connect(
    `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.mzurfjq.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )

  // 스키마 연결
  const models = {}
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in schema) {
    models[key] = mongoose.model(key, schema[key])
  }
  return models
})()
module.exports = model
