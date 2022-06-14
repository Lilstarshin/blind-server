/* eslint-disable func-names */

const mongoose = require('mongoose')
const crypto = require('crypto')
require('dotenv').config()
const { SALT } = process.env
const { Schema } = mongoose

const User = new Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  salt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  nickname: { type: String, required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
})

// password 가상 선택자,
User.virtual('password').set(function (password) {
  // eslint-disable-next-line no-underscore-dangle
  this._password = password
  this.salt = this.makeSalt()
  this.hashedPassword = this.encryptPassword(password)
})

// Salt 생성 함수
User.method(
  'makeSalt',
  () => `${Math.round(new Date().valueOf() * Math.random())}${SALT}`
)
// 해시된 비밀번호 생성 함수
User.method('encryptPassword', function (plainPassword) {
  return crypto
    .createHmac('sha256', this.salt)
    .update(plainPassword)
    .digest('hex')
})

// 사용자 인증 함수
User.method('authenticate', function (plainPassword) {
  const inputPassword = this.encryptPassword(plainPassword)
  return inputPassword === this.hashedPassword
})

module.exports = User
