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
router.get('/post', async function (req, res) {
	try {
		let post = await Post.find().populate("category").populate('user').lean();
		res.json(post)

	} catch (err) {
		res.status(500).send(err.message)
	}
});

// router.get('/post/:id', async function (req, res) {
// 	try {
// 		let { id } = req.params;
// 		let post = await Post.findById(id).populate('category').populate('user')
// 			.populate({
// 				path: 'comments.comment_user',
// 				select: 'username',
// 			})
// 			.populate('comments.text')
// 			.lean();

// 		if (!post) {
// 			return res.status(404).json({ message: 'Post not found' });
// 		};
// 		console.log('Post:', post);
// 		console.log(post.comments)
// 		res.json(post);
// 	} catch (err) {

// 		res.status(500).send(err.message)
// 	}
// });

router.put('/post/:id', async function (req, res) {
	try {
		let { id } = req.params
		let post = await Post.findById(id)
		let new_data = {}

		if (!post)
			return res.status(404).json({ msg: "post does not exist", code: 404 });

		new_data = { ...post._doc, ...req.body };

		post.overwrite(new_data);
		await post.save();

		res.json(post)
	} catch (err) {
		res.status(500).send(err.message)
	}
});

router.delete('/post/:id', async function (req, res) {
	try {
		let { id } = req.params
		let post = await Post.findOneAndDelete({ _id: id });

		if (!post) return res.status(404).json({ msg: "post does not exit", code: 404 });
		res.json({ msg: "Post deleted" })

	} catch (err) {
		res.status(500).send(err.message)
	}
});

router.get('/post/category/:categoryId', async (req, res) => {
	try {
		const categoryId = req.params.categoryId;
		const post = await Post.find({ category: categoryId });
		res.json(post);
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

router.get('/post/:id/views', async (req, res) => {
	try {
		const { id } = req.params;
		console.log('Received ID:', id);

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ err: 'Invalid post ID' });
		}

		const post = await Post.findById(id);
		if (!post) {
			return res.status(404).json({ err: 'Post not found' });
		}

		console.log('Retrieved post:', post);
		console.log('Current view count:', post.views);

		if (typeof post.views !== 'number') {
			console.error('Invalid view count data type');
			return res.status(500).json({ err: 'Invalid view count data type' });
		}

		console.log('View count before increment:', post.views);

		post.views += 1;
		await post.save();

		console.log('View count after increment:', post.views);

		res.json({ viewCount: post.views });
	} catch (err) {
		console.error('Error while fetching post views:', err);
		res.status(500).json({ err: 'Error while fetching post views' });
	}
});

router.post('/post/:id/increment-view', async (req, res) => {
	try {
		const { id } = req.params;
		const post = await Post.findById(id);

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ err: 'Invalid post ID' });
		}

		if (!post) {
			return res.status(404).json({ err: 'Post not found' });
		}

		if (!post.viewsIncremented) {
			post.views += 1;
			post.viewsIncremented = true;
			await post.save();
		}

		res.json({ viewCount: post.views });
	} catch (err) {
		console.error('Error while incrementing post views:', err);
		res.status(500).json({ err: 'Error while incrementing post views' });
	}
});

router.get('/posts-with-users', async function (req, res) {
	try {
		let postsWithUsers = await Post.find()
			.populate('user')
			.populate('comments.comment_user')
			.lean();

		res.json(postsWithUsers);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// router.post('/post', postimage.any(), async function (req, res) {
// 	try {
// 		console.log('Received request body:', req.body);
// 		console.log('Received files:', req.files);

// 		const { title, header, location, content, price, category, user } = req.body;

// 		// Ensure all required fields are provided
// 		if (!title) {
// 			return res.status(400).json({ message: "Title is required." });
// 		}
// 		if (!header) {
// 			return res.status(400).json({ message: "Header is required." });
// 		}
// 		if (!content) {
// 			return res.status(400).json({ message: "Content is required." });
// 		}
// 		if (!price) {
// 			return res.status(400).json({ message: "Price is required." });
// 		}
// 		if (!category) {
// 			return res.status(400).json({ message: "Category is required." });
// 		}
// 		if (!user) {
// 			return res.status(400).json({ message: "User is required." });
// 		}

// 		// Validate user ID
// 		if (!ObjectId.isValid(user)) {
// 			return res.status(400).json({ msg: 'Invalid user ID' });
// 		}

// 		const foundUser = await User.findById(user);
// 		if (!foundUser) {
// 			return res.status(404).json({ msg: 'User not found' });
// 		}

// 		if (foundUser.role !== 'admin') {
// 			return res.status(403).json({ msg: 'Only admins can create posts' });
// 		}

// 		// Validate category
// 		if (!ObjectId.isValid(category)) {
// 			return res.status(400).json({ msg: 'Invalid category ID' });
// 		}

// 		const foundCategory = await Category.findById(category);
// 		if (!foundCategory) {
// 			return res.status(404).json({ msg: 'Category not found' });
// 		}

// 		// Ensure we have the files and handle them
// 		let imagePaths = [];  // Store multiple images
// 		let videoPath = "";   // Store one video

// 		if (req.files && req.files.length > 0) {
// 			req.files.forEach(file => {
// 				if (file.fieldname === 'image[]') {
// 					imagePaths.push(FILE_PATH + file.filename); // Store multiple images
// 				} else if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
// 					if (videoPath) {
// 						return res.status(400).json({ msg: 'Only one video is allowed.' }); // Allow only one video
// 					}
// 					videoPath = FILE_PATH + file.filename; // Store one video
// 				}
// 			});
// 		}

// 		if (imagePaths.length === 0) {
// 			return res.status(400).json({ msg: 'At least one image is required.' });
// 		}
// 		if (!videoPath) {
// 			return res.status(400).json({ msg: 'At least one video is required.' });
// 		}

// 		// Create a new post
// 		const newPost = new Post({
// 			title,
// 			images: imagePaths,   // Store multiple images
// 			video: videoPath,     // Store one video
// 			header,
// 			location,
// 			content,
// 			price,
// 			category,
// 			user,
// 		});

// 		await newPost.save();

// 		// Update category with the new post ID
// 		await Category.findByIdAndUpdate(category, { $push: { posts: newPost._id } });

// 		res.status(200).json({
// 			success: true,
// 			message: 'Post created successfully',
// 			data: newPost,
// 		});
// 	} catch (err) {
// 		console.error('Error creating post:', err);
// 		res.status(500).json({ success: false, message: err.message });
// 	}
// });

router.post("/product", async function (req, res) {
	try {
		console.log("Received request body:", req.body);

		const { name, price, category,images, content  } = req.body;

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

		await newPost.save();

		// Update category with the new post ID
		await Category.findByIdAndUpdate(category, { $push: { products: newProduct._id } });

		res.status(200).json({
			success: true,
			message: "Product created successfully",
			data: newPost,
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
            // .populate('user')          // Populate user information (author of the post)
            // .populate({
            //     path: 'comments.comment_user', // Populate comment user's info
            //     select: 'username',  // Only return the username of the comment author
            // })
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