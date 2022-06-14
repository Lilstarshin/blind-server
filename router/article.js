/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
// @ts-check
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { SECRET } = process.env
const router = express.Router()
// @ts-ignore
const { Article, Comment, Reply } = require('../mongoose/model')

// 개별 게시글 가져오는 라우트
router.get('/article/:key', async (req, res) => {
  const { key } = req.params
  // console.log(key)
  const article = await Article.findOne({ key: key })
    .populate('board')
    .populate({
      path: 'author',
      populate: { path: 'company' },
    })
  // console.log('article###', article)
  const commentList = await Comment.find({ article: article._id }).populate({
    path: 'author',
    populate: { path: 'company' },
  })

  Promise.all(
    commentList.map(async (v) => {
      const replies = await Reply.find({ comment: v._id }).populate({
        path: 'author',
        populate: { path: 'company' },
      })
      // console.log('v###', v.author)
      return {
        ...v,
        author: {
          ...v.author,
          nickname: `${v.author.nickname[0]}${'*'.repeat(
            v.author.nickname.length - 1
          )}`,
        },
        replies: replies.map((r) =>
          // console.log(r._doc)
          ({
            ...r._doc,
            author: {
              ...r._doc.author._doc,
              nickname: `${r._doc.author._doc.nickname[0]}${'*'.repeat(
                r._doc.author._doc.nickname.length - 1
              )}`,
            },
          })
        ), // 대댓글 배열
      }
    })
  )
    .then((comment) => {
      // console.log('comment###', comment)
      res.send({
        article: {
          ...article._doc,
          author: {
            ...article._doc.author._doc,
            nickname: `${article.author._doc.nickname[0]}${'*'.repeat(
              article._doc.author._doc.nickname.length - 1
            )}`,
          },
        },
        comment: comment,
      })
    })
    .catch((err) => {
      console.log(err)
    })
})

// 게시글 추가
router.post('/article/create', async (req, res) => {
  const { title, content, board, image } = req.body
  const { authorization } = req.headers
  if (!authorization) {
    res.send({
      error: true,
      msg: 'Token not found',
    })
    return
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, SECRET, async (err, data) => {
    if (err) {
      res.send(err)
    }
    const payload = {
      // @ts-ignore
      author: data.id,
      title,
      content,
      board,
      articleImgAddress: image,
    }
    const newArticle = await Article(payload).save()
    res.send(newArticle)
  })
})

// 게시글 수정하기
router.patch('/article/update', async (req, res) => {
  const { id, author, content } = req.body
  const updatedArticle = await Article.findOneAndUpdate(
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
  res.send(updatedArticle)
})

// 게시물 삭제하기(하드)
router.delete('/article/delete/hard', async (req, res) => {
  const { id, author } = req.body
  const deletedArticle = await Article.deleteOne({
    _id: id,
    author,
  }).save()
  // console.log(deletedArticle)
  res.send(!!deletedArticle)
})
// 게시물 삭제하기(소프트)
router.delete('/article/delete/soft', async (req, res) => {
  const { id, author } = req.body
  const deletedArticle = await Article.findOneAndUpdate(
    {
      _id: id,
      author,
    },
    {
      deleteTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30일 후 시간이 저장
    }
  )

  res.send(!!deletedArticle)
})

module.exports = router
