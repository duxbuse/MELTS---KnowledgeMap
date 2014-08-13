// app/models/map.js
var mongoose = require('mongoose');

module.exports = mongoose.model('node', {
    data: {title: String, unit: String},
    links: [{ source: String, target: String }],
    done: Boolean
});