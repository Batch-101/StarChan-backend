const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    token: String,
    date: Date,
    isAdmin: Boolean,
    link: String,
    favoritePictures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pictures' }]
});

const User = mongoose.model('users', userSchema);

module.exports = User;