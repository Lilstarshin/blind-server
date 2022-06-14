/* eslint-disable no-underscore-dangle */
// @ts-check
const express = require('express')
const { log } = require('console')

const router = express.Router()

// @ts-ignore
const { Company } = require('../mongoose/model')

// 회사 추가
router.post('/company/create', async (req, res) => {
  const { name } = req.body

  const newCompany = await Company({
    name,
  }).save()
  log(newCompany)

  res.send(!!newCompany._id)
})

// 회사 인기있는 목록 가져오기
router.get('/company/list/famous', async (req, res) => {
  const company = await Company.find().limit(10).sort({ realtimeScore: -1 })
  // console.log(company)
  res.send(company)
})

module.exports = router
