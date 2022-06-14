// @ts-check

const AWS = require('aws-sdk')
const express = require('express')
const cors = require('cors')
const formidable = require('express-formidable')
const fs = require('fs')
const { log } = require('console')
const {
  article,
  user,
  comment,
  company,
  board,
  reply,
  search,
} = require('./router')
require('dotenv').config()

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env
AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
})
const s3 = new AWS.S3()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 기능별 라우터 추가
app.use(article)
app.use(user)
app.use(company)
app.use(board)
app.use(comment)
app.use(reply)
app.use(search)

app.use(formidable())
// 상태 확인용
app.get('/', (req, res) => {
  res.send('Server is running!')
})

app.post('/upload', (req, res) => {
  if (!req.files) {
    res.send({ error: true, data: null, msg: 'file not found' })
    return
  }
  const raw = req.files.file

  const buffer = fs.readFileSync(raw.path)
  const fileName = new Date().getTime() + raw.name
  const params = {
    Body: buffer,
    Bucket: 'lilstarshin',
    Key: fileName,
    ACL: 'public-read',
  }
  s3.putObject(params, (err) => {
    if (err) {
      log(err)
      res.send({ error: true, data: null, msg: 'aws s3 error' })
      return
    }
    res.send({ error: false, key: fileName, msg: 'upload sucess' })
  })
})

app.listen(PORT, () => {
  log(`App listening at http://localhost:${PORT}`)
})
