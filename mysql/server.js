const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure file uploads
const upload = multer({ dest: 'uploads/' });

// MySQL connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'helloo',
    database: 'portfolio'
};

let db;
(async () => {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
})();

// Routes
app.post('/submit-form', upload.single('attachment'), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const attachment = req.file ? req.file.filename : null;

        await db.execute(
            'INSERT INTO messages (name, email, message, attachment) VALUES (?, ?, ?, ?)',
            [name, email, message, attachment]
        );

        res.status(200).send('Message submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting message.');
    }
});

app.get('/messages', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching messages.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

