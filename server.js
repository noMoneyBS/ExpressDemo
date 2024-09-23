require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const sanitize = require('sanitize-html');
const winston = require('winston');

const app = express();
app.use(cors());

// Logger setup
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' }),
    ],
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup with file size limit
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|webp|heic|heif|tiff/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, png, gif, webp, heic, heif, tiff)'));
        }
    }
});

// API route
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            const filePath = `/uploads/${req.file.filename}`;
            res.json({ filePath: filePath, message: 'Image upload successful' });
        } else if (req.body) {
            const texts = Object.keys(req.body).map(key => sanitize(req.body[key])).join(' ');
            const response = await axios.post(process.env.OPENAI_API_URL, {
                model: process.env.OPENAI_MODEL,
                messages: [{ role: 'user', content: `使用英文根据我提供的食物推荐一个食谱: ${texts}` }],
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            const recipes = response.data.choices[0].message.content;
            res.json({ recipes: recipes, message: 'Text upload and recipe recommendation successful' });
        } else {
            res.status(400).send('No file or text uploaded');
        }
    } catch (error) {
        logger.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Static file hosting (for accessing uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});