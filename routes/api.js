var express = require('express')
var router = express.Router()
var apicalls = require('../modules/apicalls')
var User = require('../models/user')

var searchIngredients = apicalls.searchIngredients
var searchResults = apicalls.searchResults

router.get('/ingredients/autocomplete', function (req, res, next) {
  var params = req.query
  var searchText = params.query
  var number = params.number
  searchIngredients(searchText, number, function (err, body) {
    if (!err) {
      res.json(body)
    } else {
      res.status(500).json(err)
      console.error(err)
      console.log(err.stack)
    }
  })
})

router.get('/recipes/results', function (req, res, next) {
  var params = req.query
  var ingredients = JSON.parse(params.ingredients)
  var page = parseInt(params.page)
  searchResults(ingredients, page, function (err, body) {
    if (!err) {
      res.json(body)
    } else {
      res.status(500).json(err)
      console.error(err)
    }
  })
})

router.get('/user/data', function (req, res, next) {
  if (req.session.user) {
    res.json({ user: req.session.user })
  } else {
    res.status(404).end()
  }
})

router.post('/user/sync', function (req, res, next) {
  const userData = req.body
  User.findOne({ id: req.session.user.id }, function (err, user) {
    if (!err) {
      user.syncUser(userData, function (err, status) {
        if (!err && status.ok) {
          res.status(200).end()
        } else {
          res.status(500).end()
        }
      })
    } else {
      res.status(500).end()
    }
  })
})

module.exports = router
