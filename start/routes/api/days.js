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


// Create a day   CHECK
router.post('/days/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    Day.create({ number: id } )
        .then(function (day) {
            res.json(day);
        })
        .catch(next)
});

// add an attraction from that day  CHECK
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

// delete an activity from a day
router.delete('/days/:id', function (req, res, next) {
    var name = req.body.name;
    var id = req.body.id;

    Hotel.findOne({where: {id: id, name: name}})
    .then(function(foundHotel){
        if(foundHotel){
             Day.findOne({where: {hotelId: foundHotel.id}})
             .then(function(foundDayInstance){
                 foundDayInstance.destroy();
             })
        }
        else {
           return Restaurant.findOne({where: {id: id, name: name}})
        }
    })
    .then(function(foundRestaurant){
        if(foundRestaurant){
            Day.getRestaurant({where: {restaurantId: foundRestaurant.id}})
            

        }
        else {
           Activity.findOne({where: {id: id, name: name}})
        }
    })
    .then(function(foundActivity){
        if(foundActivity){

        }        
    })  
    .catch(next);
});


module.exports = router;