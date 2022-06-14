/* eslint-disable no-underscore-dangle */
// @ts-check
const express = require('express')

const router = express.Router()

// @ts-ignore
const { Article, Board } = require('../mongoose/model')

// 메인에서 여러 게시판 글을 모아서 보여주는 라우트
router.get('/main', async (req, res) => {
  const board = await Board.find()
  if (!Array.isArray(board)) {
    res.send({
      error: true,
      msg: '게시판을 발견할 수 없음.',
    })
    return
  }
  const mainContent = []
  Promise.all(
    board.map(async (b) => {
      const recentArticles = await Article.find({ board: b._id })
      if (!Array.isArray(recentArticles)) {
        return
      }
      mainContent.push({
        ...b._doc,
        content: recentArticles,
      })
    })
  )
    .then(() => {
      res.send({
        mainContent,
        error: false,
        msg: '성공',
      })
    })
    .catch((err) => {
      console.log(err)
      res.send({
        mainContent: null,
        error: true,
        msg: '서버 에러',
      })
    })
})

router.get('/board/list', async (req, res) => {
  const board = await Board.find({})
  res.send(board)
})

// 게시판별 게시글 가져오는 라우트
router.get('/board/:slug', async (req, res) => {
  const { slug } = req.params
  const { lastIndex } = req.query // 무한 스크롤 구현 시 사용할 부분

  const board = await Board.findOne({ slug })
  if (!board._id) {
    res.send({
      article: [],
      error: true,
      msg: '존재하지 앟는 게시판',
    })
    return
  }

  const findOption = {
    board: board._id,
  }
  if (lastIndex !== '0') {
    findOption._id = { $lt: lastIndex }
  }
  const article = await Article.find(findOption)
    .sort({ _id: -1 })
    .limit(2)
    .populate({
      path: 'author',
      populate: { path: 'company' },
    })

  const formatedArtilce = article.map((v) => ({
    ...v._doc,
    author: {
      ...v._doc.author._doc,
      nickname: `${v._doc.author._doc.nickname[0]}${'*'.repeat(
        v._doc.author._doc.nickname.length - 1
      )}`,
    },
  }))

  res.send({ article: formatedArtilce, error: false, msg: '성공' })
})

// 관리자: 게시판 추가
router.post('/board/create', async (req, res) => {
  const { title, slug } = req.body

  const newBoard = await Board({
    title,
    slug,
  }).save()
  res.send(!!newBoard._id)
})

module.exports = router
