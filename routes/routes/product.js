const Product = require("../../models/product");
const authenticate = require('../../middleware/authenticate'); 
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const multer = require("multer");
const path = require("path");
const PORT = 3007;
const FILE_PATH = `http://localhost:${PORT}/postimage/`;
// const FILE_PATH = `https://imgurif-api.onrender.com/postimage/`;
const User = require("../../models/user");
const Category = require("../../models/category");
// const Like = require("../../models/like");
const express = require('express');
const router = express.Router();

const storage = multer.diskStorage({
	destination: (reg, file, cb) => {
		//let _dir = path.join(__dirname, "../../public/postimage");
		//cb(null, _dir);
		// cb(null, )
		cb(null, "public/postimage")

	},
	filename: (reg, file, cb) => {
		let filename = file.originalname.toLowerCase();
		cb(null, filename);
	},
});

const postimage = multer({ storage: storage });

// const routes = function (app) {
router.get('/product', async function (req, res) {
	try {
		let product = await Product.find().populate("category").lean();
		res.json(product)

	} catch (err) {
		res.status(500).send(err.message)
	}
});

router.put('/product/:id', async function (req, res) {
	try {
		let { id } = req.params
		let product = await Product.findById(id)
		let new_data = {}

		if (!product)
			return res.status(404).json({ msg: "product does not exist", code: 404 });

		new_data = { ...product._doc, ...req.body };

		product.overwrite(new_data);
		await product.save();

		res.json(product)
	} catch (err) {
		res.status(500).send(err.message)
	}
});

router.delete('/product/:id', async function (req, res) {
	try {
		let { id } = req.params
		let product = await Product.findOneAndDelete({ _id: id });

		if (!product) return res.status(404).json({ msg: "product does not exit", code: 404 });
		res.json({ msg: "Product deleted" })

	} catch (err) {
		res.status(500).send(err.message)
	}
});

router.get('/product/category/:categoryId', async (req, res) => {
	try {
		const categoryId = req.params.categoryId;
		const product = await Product.find({ category: categoryId });
		res.json(product);
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

router.post("/product", async function (req, res) {
	try {
		console.log("Received request body:", req.body);

		const { name, price, category, images, content  } = req.body;

		// Ensure all required fields are provided
		if (!name) {
			return res.status(400).json({ message: "Name is required." });
		}
		if (!content) {
			return res.status(400).json({ message: "Content is required." });
		}
		if (!price) {
			return res.status(400).json({ message: "Price is required." });
		}
		if (!category) {
			return res.status(400).json({ message: "Category is required." });
		}

		// Validate category
		if (!ObjectId.isValid(category)) {
			return res.status(400).json({ msg: "Invalid category ID" });
		}

		const foundCategory = await Category.findById(category);
		if (!foundCategory) {
			return res.status(404).json({ msg: "Category not found" });
		}

		// Ensure images and video URLs are provided
		const imagePaths = Array.isArray(images) ? images : [];
		if (imagePaths.length === 0) {
			return res.status(400).json({ msg: "At least one image URL is required." });
		}

		// Create a new post
		const newProduct = new Product({
			name,
			images: imagePaths, // Accepting image URLs
			content,
			price,
			category,
		});

		await newProduct.save();

		// Update category with the new post ID
		await Category.findByIdAndUpdate(category, { $push: { products: newProduct._id } });

		res.status(200).json({
			success: true,
			message: "Product created successfully",
			data: newProduct,
		});
	} catch (err) {
		console.error("Error creating product:", err);
		res.status(500).json({ success: false, message: err.message });
	}
});

router.get('/product/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // const userId = req.user.userId;  // Access the decoded userId from the token

        if (!id) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        // Fetch the post by ID and populate its details (category, user, comments, etc.)
        let product = await Product.findById(id)
            .populate('category')      // Populate category information
            .lean();  // Convert the mongoose document to plain JavaScript object

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);  // Send the post data

    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

module.exports = router;