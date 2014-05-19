// app/models/todo.js
var mongoose = require('mongoose');

module.exports = mongoose.model('Todo', {
	text : String,
	done : Boolean
});