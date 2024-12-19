const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const port = 3000;

// Middleware for parsing URL-encoded data and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up static folder to serve images and projects
app.use(express.static(path.join(__dirname, 'public')));

// Set up storage for images using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Nodemailer transporter setup (using SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // From the .env file
        pass: process.env.EMAIL_PASS, // From the .env file
    },
    tls: {
        rejectUnauthorized: false, // Allow connection to untrusted TLS servers
    },
});

// Route to serve the contact form (GET /contact)
app.get('/contact', (req, res) => {
    res.send(`
        <form action="/contact" method="POST" enctype="multipart/form-data">
            <label for="name">Name:</label><br>
            <input type="text" id="name" name="name" required><br><br>
            
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email" required><br><br>
            
            <label for="message">Message:</label><br>
            <textarea id="message" name="message" required></textarea><br><br>
            
            <label for="profileImage">Profile Image (optional):</label><br>
            <input type="file" id="profileImage" name="profileImage"><br><br>
            
            <button type="submit">Send</button>
        </form>
    `);
});

// Route for contact form submission (POST /contact)
app.post('/contact', upload.single('profileImage'), (req, res) => {
    try {
        const { name, email, message } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        // Email options
        const mailOptions = {
            from: email, // Sender's email (user's email)
            to: process.env.RECIPIENT_EMAIL, // Recipient's email
            subject: 'New Contact Form Submission',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            attachments: profileImage
                ? [
                      {
                          filename: req.file.originalname,
                          path: path.join(__dirname, 'public/images', profileImage),
                      },
                  ]
                : [],
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('Error sending email.');
            }
            console.log('Email sent:', info.response);
            res.status(200).send('Message sent successfully.');
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).send('Internal server error.');
    }
});

// Route for retrieving projects (GET /projects)
app.get('/projects', (req, res) => {
    const projects = [
        {
            name: 'Dietary Counter',
            description: 'Track and monitor your daily diet with this intelligent application.',
            image: 'dietary-counter.jpg', // Example image name for the project
        },
        {
            name: 'Health-Conscious Cookbook',
            description: 'Find healthy recipes based on your dietary restrictions and preferences.',
            image: 'health-cookbook.jpg',
        },
        {
            name: 'AI Model for Cancer Detection',
            description: 'Developing a model to help diagnose and detect cancer early in dogs.',
            image: 'cancer-detection.jpg',
        },
    ];
    res.json(projects);
});

// Route for serving images (GET /images/:imageName)
app.get('/images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'public/images', req.params.imageName);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send('Image not found');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
