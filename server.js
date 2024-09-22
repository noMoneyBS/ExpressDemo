const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const axios = require('axios');
const app = express();

// 启用 CORS，允许前端发送请求
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
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

app.post('/upload', upload.single('image'), async (req, res) => {
    // 如果上传了图片
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ filePath: filePath, message: 'Image upload successful' });
    }
    
    // 如果上传了文本
    if (req.body) {
        const texts = Object.keys(req.body).map(key => req.body[key]).join(' ');
        
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: `使用英文根据我提供的食物推荐一个食谱: ${texts}` }]
            }, {
                headers: {
                    'Authorization': `Bearer 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`,
                    'Content-Type': 'application/json'
                }
            });
            
            const recipes = response.data.choices[0].message.content;
            res.json({ recipes: recipes, message: 'Text upload and recipe recommendation successful' });
        } catch (error) {
            console.error('Error contacting OpenAI:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to contact OpenAI API' });
        }
    } else {
        return res.status(400).send('No file or text uploaded');
    }
});

// 静态文件托管（用于访问上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 启动服务器
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`服务器在 http://localhost:${PORT} 上运行`);
});