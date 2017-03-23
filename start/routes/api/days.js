var Promise = require('bluebird');
var router = require('express').Router();

var db = require('../../models');
var Hotel = db.model('hotel');
var Restaurant = db.model('restaurant');
var Activity = db.model('activity');
var Place = db.model('place');
var Day = db.model('day');

// Send info on all of the days
router.get('/days', function (req, res, next) {
    Day.findAll()
        .then(function (days) {
            res.json(days);
        })
        .catch(next)
});

// Send one day's activities
router.get('/days/:id', function (req, res, next) {
    var id = req.params.id;
    Day.findOne({ where: { id: id } })
        .then(function (day) {
            res.json(day);
        })
        .catch(next)
});

// Delete a day's activities
router.delete('/days/:id', function (req, res, next) {
    var id = req.params.id;
    Day.findOne({ where: { number: id } })
        .then(function (day) {
            return day.destroy();
            // res.json(day);
        })
        .catch(next)
});


// Create a day
router.post('/days/:id', function (req, res, next) {
    var id = req.params.id;
    Day.create({ where: { number: id } })
        .then(function (day) {
            res.json(day);
        })
        .catch(next)
});

// add and remove an attraction from that day
router.put('/days/:id/:type', function (req, res, next) {
    console.log(req.body);
    var type = req.params.type;
    Day.findById(req.params.id)
    .then(function(foundDay){
        
        if(type === 'hotels'){
            foundDay.setHotel(req.body.id);
        }
        else if (type === 'restaurants'){
             foundDay.addRestaurant(req.body.id);
        }
        else if (type === 'activities'){
             foundDay.addActivity(req.body.id);
        }
    })
    .catch(next);
});


module.exports = router;