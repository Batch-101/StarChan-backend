const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'subjects' }],
    title: String
});




const Category = mongoose.model('categories', categorySchema);

module.exports = Category;