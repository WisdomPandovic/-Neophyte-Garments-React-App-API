const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
	name: {type: String, required:true, trim: true, unique: true},
	product: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
})

const Category= mongoose.model("category",CategorySchema)
module.exports = Category;