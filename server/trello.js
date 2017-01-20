'use strict'

//const db = require('APP/db')
//const User = db.model('users')


module.exports = require('express').Router()
	.get('/', (req, res, next) =>
		res.json({foo: 'bar'}))
	.post('/', (req, res, next) =>
		res.json({foo: 'bar', content: req.body.text}))