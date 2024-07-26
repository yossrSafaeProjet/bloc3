const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const app = express();
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}
// Middleware

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));

const csrfProtection = csrf({ cookie: true });

// Middleware
app.use(cookieParser());
app.use(csrfProtection);
//Session
app.use(session({
  secret: 'abc',
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // `true` pour HTTPS en production
      httpOnly: true,
      maxAge: 1000 * 60 * 30 // Cookie expire après 30 minutes
  }
}));
// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

// Routes
//récupérer csrf 
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});


app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin',csrfProtection,(req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'azerty', { expiresIn: 86400 });
    req.session.token=token;
    console.log(req.session.token)
    res.status(200).send({ auth: true, token });
  });
});
//Ajout de vérification de token aprés la connexion 
const authenticateSession = (req, res, next) => {
  const token = req.session.token; // Accéder au token stocké dans la session
console.log(req.session)
  if (token) {
    jwt.verify(token, 'azerty', (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user; // Ajouter les informations de l'utilisateur à la requête
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};

// Route protégée
app.get('/protected', authenticateSession, (req, res) => {

  res.status(200).json({ message: 'Access granted to protected route.' });
});

//Récupére toutes les clients 
app.get('/api/dashboard/clients/AllClient', (req, res) => {
  const query = 'SELECT * FROM clients';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).send('Erreur du serveur');
      return;
    }
    res.json(results);
  });
});
//Récupére un client  
app.get('/api/dashboard/clients/:id',csrfProtection, (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM clients where id=?';
  
  db.query(query,[userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).send('Erreur du serveur');
      return;
    }
    res.json(results);
  });
});

app.delete('/api/users/:id', csrfProtection,(req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const sql = 'DELETE FROM clients WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.affectedRows === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('User deleted successfully');
  });
});

// Mise à jour d'un client
app.put('/api/update/:id', csrfProtection, (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const { nom_famille, prenom, email, tel, type_service } = req.body;

  // Correction de la requête SQL pour mettre à jour les données
  const sql = 'UPDATE clients SET nom_famille = ?, prenom = ?, email = ?, tel = ?, type_service = ? WHERE id = ?';
  db.query(sql, [nom_famille, prenom, email, tel, type_service, userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).send('User updated successfully');
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")))
app.get("*", (_, res) => {
    res.sendFile(
      path.join(__dirname, "./client/dist/index.html")
    )
})
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
