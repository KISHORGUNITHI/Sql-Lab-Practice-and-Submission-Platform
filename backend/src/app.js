import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import teacherRoutes from './routes/teacherRoutes.js';


// Fix for __dirname when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Point to the views and public directories located one level up from src/
const viewsPath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Serve static CSS and JS from the public folder
app.use(express.static(publicPath));
// Parse URL-encoded bodies for standard POST forms
app.use(express.urlencoded({ extended: true }));


// --- Frontend Routes ---

// Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Student Area
app.get('/student', (req, res) => {
    res.render('student/dashboard');
});

app.get('/student/problem/:id', (req, res) => {
    res.render('student/solve-question');
});

app.post('/student/problem/:id/run', (req, res) => {
    // Currently redirects back; implement run logic later
    res.redirect(`/student/problem/${req.params.id}`);
});

// Teacher Area

// Create Problem
app.get('/teacher/create', (req, res) => {
    res.render('teacher/create-question');
});

// Problem Creation Form submission
app.use('/teacher', teacherRoutes);

// Any edit or delete actions placeholders
app.get('/teacher/edit/:id', (req, res) => {
    res.send('Edit functionality coming soon');
});



// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
