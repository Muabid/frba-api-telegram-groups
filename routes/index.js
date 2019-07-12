var express = require('express');
var router = express.Router();

const url = 'mongodb://localhost:27017';
const mongo = require('mongodb').MongoClient(url);



router.get('/:_id', function(req, res, next) {

  mongo.connect((err,cli) => {
    const db = cli.db('telegram');
    const collection = db.collection('messages');
    let id = parseInt(req.params._id);
    collection.countDocuments({"chat.id":id},{},(mongoError, total) =>{
      if(mongoError)
        throw mongoError
      collection.aggregate([
        {$match:{"chat.id":id}},
        {$group:{"_id":{user:"$from.id",chat:"$chat"},
            "messagesCount":{"$sum":1},
            "stickersCount":{"$sum":{$cond:[{$gte:["$sticker",null]},1,0]}},
            "photosCount":{"$sum":{$cond:[{$gte:["$photo",null]},1,0]}},
            "first_name":{$first:"$from.first_name"}
          }},
        {$project: {"first_name":1,"messagesCount":1,"percentage":{"$multiply":[{"$divide":[100,total]},"$messagesCount"]}}},
        {$sort:{messages: -1}}],(mongoError, aggregationCursor) => {
        aggregationCursor.toArray((mongoError1, objects) => {
          console.log(objects)
          res.render('index', {users:objects});
        })
      })
    });

  });

});



router.get('/:_id/pins', function(req, res, next) {

  mongo.connect((err,cli) => {
    const db = cli.db('telegram');
    const collection = db.collection('messages');
    let id = parseInt(req.params._id);
    collection.find({"chat.id":id,"pin":1}).toArray((err,array) =>{
      console.log(array);
      res.render('pins',{message:array.slice(1),first_pin:array[0],chat:array[0].chat.title});

    });

  });

});

module.exports = router;
