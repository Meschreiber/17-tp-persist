const Sequelize = require('sequelize');
const db = require('./_db');

const Day = db.define('day', {
    number: Sequelize.INTEGER
})

module.exports = Day;