/* eslint-disable no-underscore-dangle */
// @ts-check
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
require('dotenv').config()

const { SECRET } = process.env
// @ts-ignore
const { Comment, Article } = require('../mongoose/model')

// 댓글 생성하기
router.post('/comment/create', async (req, res) => {
  const { article, content } = req.body
  const { authorization } = req.headers

  if (!authorization) {
    res.send({
      error: true,
      msg: '토큰이 존재하지 않음',
    })
    return
  }

  const token = authorization.split(' ')[1]

  jwt.verify(token, SECRET, async (err, data) => {
    if (err) {
      res.send(err)
    }

    const newComment = await Comment({
      author: data.id,
      article,
      content,
    }).save()

    await Article.findOneAndUpdate(
      { _id: article },
      {
        $inc: { commentCount: 1 },
      }
    )
    res.send(!!newComment._id)
  })
})

// 댓글 수정하기
router.patch('/comment/update', async (req, res) => {
  const { id, author, content } = req.body
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: id,
      author,
    },
    {
      content,
    },
    {
      new: true,
    }
  )
  // console.log(updatedComment)
  res.send(updatedComment)
})
// 댓글 삭제하기(하드)
router.delete('/comment/delete/hard', async (req, res) => {
  const { id, author } = req.body
  const deletedComment = await Comment.deleteOne({
    _id: id,
    author,
  }).save()
  // console.log(deletedComment)
  res.send(!!deletedComment)
})
// 댓글 삭제하기(소프트)
router.delete('/comment/delete/soft', async (req, res) => {
  const { id, author } = req.body
  const deletedComment = await Comment.findOneAndUpdate(
    {
      _id: id,
      author,
    },
    {
      deleteTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30일 후 시간이 저장
    }
  )
  // console.log(deletedComment)
  res.send(!!deletedComment)
})

module.exports = router
