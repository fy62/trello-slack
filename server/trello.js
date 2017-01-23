'use strict'

//const db = require('APP/db')
//const User = db.model('users')
const app = require('APP'), {env} = app;
var Trello = require("node-trello");
var t = new Trello(env.TRELLO_KEY, env.TRELLO_TOKEN);

var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
    token: 'xoxb-130681180934-l7UAAlx62Z3nyHRq7Nm03ivV',
    name: 'hh'
});

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':spiral_note_pad:'
    };
});


module.exports = require('express').Router()
	.get('/boards', (req, res, next) => {
    // t.del(`/1/webhooks/5886163dfe9a5bf938156a4f`, function(err, data) {if (err) throw err; console.log(data)});
    // t.del(`/1/webhooks/588618e05ef8a6174549e75c`, function(err, data) {if (err) throw err; console.log(data)});
    // t.del(`/1/webhooks/58861b193c26216a971bd133`, function(err, data) {if (err) throw err; console.log(data)});
    t.get(`/1/members/my/boards`, function(err, data) {
      if (err) throw err;
      const boards = [];
      data.forEach(board => {boards.push(`${board.name}: ${board.id}, ${board.shortUrl}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": "Your trello boards:",
        "attachments":[
            {"text": boards.join("\n")}
        ]
      }
      res.json(toSlack);
    });

  })
  .get('/lists', (req, res, next) => {
    t.get(`/1/boards/${req.query.text}/lists`, function(err, data) {
      if (err) throw err;
      const lists = [];
      data.forEach(list => {lists.push(`${list.name}: ${list.id}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Your trello lists for board ${req.query.text}`,
        "attachments":[
            {"text": lists.join("\n")}
        ]
      }
      res.json(toSlack);
    });
  })
  // .get('/board/cards', (req, res, next) => {
  //   t.get(`/1/boards/${req.query.text}/cards`, function(err, data) {
  //     if (err) throw err;
  //     const cards = [];
  //     data.forEach(card => {cards.push(`${card.name}: ${card.id}, ${card.shortUrl}`)});
  //     const toSlack = {
  //       "response_type": "ephemeral",
  //       "text": `Your trello cards in board ${req.query.text}`,
  //       "attachments":[
  //           {"text": cards.join("\n")}
  //       ]
  //     }
  //     res.json(toSlack);
  //   });
  // })
  .get('/cards', (req, res, next) => {
    t.get(`/1/lists/${req.query.text}/cards`, function(err, data) {
      if (err) throw err;
      const cards = [];
      data.forEach(card => {cards.push(`${card.name}: ${card.id}, ${card.shortUrl}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Your trello cards in list ${req.query.text}`,
        "attachments":[
            {"text": cards.join("\n")}
        ]
      }
      res.json(toSlack);
    });
  })
	.post('/hooks', (req, res, next) => {
    const callbackUrl = "https://fe2397a5.ngrok.io/api/trello";
    const sendPost = {
      "callbackURL": callbackUrl,
      "idModel": req.body.text
    }
    t.post(`/1/webhooks`, sendPost, function(err, data) {
      if (err) throw err;
      console.log(data)
      const toSlack = {
        "response_type": "in_channel",
        "text": `Set up incoming webhook on ${req.body.text} to channel trello-mine`
      }
      res.json(toSlack);
    });
  })
  .head('/', (req, res, next) => {
    res.sendStatus(200);

  })
  .post('/', (req, res, next) => {
    const message = "Automatic update from Trello:\n" + JSON.stringify(req.body.action).split(",").join("\n");
    bot.postMessageToChannel('trello-mine', message);
    res.sendStatus(200);
  })
  .post('/boards', (req, res, next) => {
    const sendPost = {
      "name": req.body.text
    }
    t.post(`/1/boards`, sendPost, function(err, data) {
      if (err) throw err;
      // const cards = [];
      // data.forEach(card => {cards.push(`${card.name}: ${card.id}, ${card.shortUrl}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Posted board: ${data}`,
      }
      res.json(toSlack);
    });
  })
  .post('/delete/board', (req, res, next) => {
    t.del(`/1/boards/${req.body.text}`, function(err, data) {
      if (err) throw err;
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Deleted board: ${req.body.text}`,
      }
      res.json(toSlack);
    });
  })
  .post('/lists', (req, res, next) => {
    const [name, idBoard] = req.body.text.split(":");
    const sendPost = {
      "name": name,
      "idBoard": idBoard
    }
    t.post(`/1/lists`, sendPost, function(err, data) {
      if (err) throw err;
      // const cards = [];
      // data.forEach(card => {cards.push(`${card.name}: ${card.id}, ${card.shortUrl}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Posted list: ${data}`,
      }
      res.json(toSlack);
    });
  })
  .post('/cards', (req, res, next) => {
    const [name, idList] = req.body.text.split(":");
    const sendPost = {
      "name": name,
      "idList": idList
    }
    t.post(`/1/cards`, sendPost, function(err, data) {
      if (err) throw err;
      // const cards = [];
      // data.forEach(card => {cards.push(`${card.name}: ${card.id}, ${card.shortUrl}`)});
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Posted card: ${data}`,
      }
      res.json(toSlack);
    });
  })
  .post('/delete/card', (req, res, next) => {
    t.del(`/1/cards/${req.body.text}`, function(err, data) {
      if (err) throw err;
      const toSlack = {
        "response_type": "ephemeral",
        "text": `Deleted card: ${req.body.text}`,
      }
      res.json(toSlack);
    });
  })

  // boardcards slash command

  // idmember: 588264a650c7f06aab61bfe2
  // post board
  // post list
  // post card
  // delete card

  // trboardcards slash command: takes in boardid
  // trnewboard slash command: takes in name
  // trdelboard slash command: takes in id
  // trnewlist slash command: takes in name:idboard
  // trnewcard slash command: takes in name:idlist
  // trdelcard slash command: takes in id



