import express from 'express'
import favicon from 'serve-favicon'
import dotenv from 'dotenv';
import process from 'node:process';
import expressLayouts from 'express-ejs-layouts';

// Utils
import { locpath } from './utils/locpath.js';
import { getDirname } from './utils/dirname.js';
import { hotreload } from './utils/hotreload.js';

const __dirname = getDirname(import.meta.url);
const env       = process.env;
const app       = express();
const port      = env.PORT || 3000;

dotenv.config();
hotreload(app, __dirname);

// Static files
app.use('/public', express.static(locpath.public_('')));

// Express layouts
app.use(expressLayouts);

// Favicon
app.use(favicon(locpath.public_('favicon.ico')));

// Use view engine
app.set('view engine', 'ejs');

// Set views directory
app.set('views', locpath.view(''));

// 
// Routes
//

app.get('/', (req, res) => {
  return res.render('pages/home', { title: 'Laboratorio de Sistemas Termodinamicos' });
});

app.use((req, res) => {
    // TODO -- Redirect to a 404 page
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log("Server listening on http://localhost:" + port);
});