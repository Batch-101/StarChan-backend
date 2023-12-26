const mongoose = require('mongoose');

const picturesSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: String,
    description: String,
    place: String,
    date: Date,
    link: String,
});

const Picture = mongoose.model('pictures', picturesSchema);

module.exports = Picture;