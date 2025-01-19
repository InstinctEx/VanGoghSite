const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/vangogh', {}).then(
  () => { console.log('Connected to MongoDB'); },
  err => { console.error('Failed to connect to MongoDB', err); }
);

const Report = mongoose.model('Report', { title: String, content: String });
const Link = mongoose.model('Link', { url: String, category: String });

const users = { admin: 'password' };

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let loggedIn = false;

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    loggedIn = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/logout', (req, res) => {
  loggedIn = false;
  res.json({ success: true });
});

app.get('/api/biography', (req, res) => {
  fs.readFile('./data/biography.json', 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

app.get('/api/tables', (req, res) => {
  fs.readFile('./data/tables.json', 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

app.get('/api/reports', (req, res) => {
  Report.find().then(reports => res.json(reports));
});

app.get('/api/links', (req, res) => {
  Link.find().then(links => res.json(links));
});

app.post('/api/reports', (req, res) => {
  if (!loggedIn) return res.status(403).json({ error: 'Unauthorized' });
  const report = new Report(req.body);
  report.save().then(() => res.json({ success: true }));
});

app.post('/api/links', (req, res) => {
  if (!loggedIn) return res.status(403).json({ error: 'Unauthorized' });
  const link = new Link(req.body);
  link.save().then(() => res.json({ success: true }));
});

app.delete('/api/reports/:id', (req, res) => {
  if (!loggedIn) return res.status(403).json({ error: 'Unauthorized' });
  Report.findByIdAndDelete(req.params.id).then(() => res.json({ success: true }));
});

app.delete('/api/links/:id', (req, res) => {
  if (!loggedIn) return res.status(403).json({ error: 'Unauthorized' });
  Link.findByIdAndDelete(req.params.id).then(() => res.json({ success: true }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));