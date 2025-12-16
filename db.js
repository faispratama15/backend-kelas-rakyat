const mysql = require('mysql2');

// Buat koneksi ke database
const db = mysql.createConnection({
  host: 'localhost',   
  user: 'root',         
  password: '',  
  database: 'kelas_rakyat' 
});

// Tes koneksi
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✅ Database connected!');
  }
});

module.exports = db;
