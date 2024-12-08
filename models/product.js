const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    images: [{ type: String, required: true }], 
    content: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category',},
    date: { type: Date, default: Date.now },
});

const Product = mongoose.model('products', ProductSchema);

module.exports = Product;