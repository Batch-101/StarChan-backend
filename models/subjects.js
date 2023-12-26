const mongoose = require('mongoose');

const answersSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    message: String,
    date: Date,
    link: String
});


const subjectsSchema = mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: String,
    message: String,
    date: Date,
    link: String,
    answers: [answersSchema]
});

const Subject = mongoose.model('subjects', subjectsSchema);

module.exports = Subject;