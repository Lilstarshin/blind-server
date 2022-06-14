/* eslint-disable no-underscore-dangle */
// @ts-check
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const router = express.Router()
// @ts-ignore
const { User } = require('../mongoose/model')
const { SECRET } = process.env
// 로그인 요청
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body
  // console.log(`Login: email:${email}, password:${password} `)
  const loginUser = await User.findOne({ email })
  // console.log('loginUser: ', loginUser)
  // eslint-disable-next-line no-underscore-dangle
  if (!loginUser) {
    res.send({
      error: true,
      msg: '존재하지 않는 이메일',
    })
    return
  }
  const correctPassword = await loginUser.authenticate(password)
  if (!correctPassword) {
    res.send({
      error: true,
      msg: '비밀번호 불일치',
    })
    return
  }

  const token = jwt.sign(
    {
      id: loginUser._id,
      email: loginUser.email,
      nickname: loginUser.nickname,
    },
    SECRET,
    {
      expiresIn: '7d',
      issuer: 'blind_clone_coding',
      subject: 'auth',
    }
  )
  res.send({
    email: loginUser.email,
    nickname: loginUser.nickname,
    token,
    error: false,
    msg: '로그인 성공',
  })
})
// 사용자 추가
router.post('/user/create', async (req, res) => {
  const { nickname, company, email, password } = req.body
  const newUser = await User({
    email,
    nickname,
    password,
    company,
  }).save()

  res.send(!!newUser._id)
})

// 사용자 토큰 체크
router.get('/user/token', (req, res) => {
  const { authorization } = req.headers
  if (!authorization) {
    res.send(false)
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, SECRET, (err, data) => {
    if (err) {
      res.send(err)
    }
    res.send({
      email: data.email,
      nickname: data.nickname,
    })
  })
})

module.exports = router
