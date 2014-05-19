// app/models/map.js
var mongoose = require('mongoose');

module.exports = mongoose.model('node', {
    title : String,
    children : Array,
    parents : Array,
    done : Boolean
});