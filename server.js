const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Rute dasar
app.get('/', (req, res) => {
  res.send('API Express + MySQL berjalan 🚀');
});

//===users===;
// --- GET semua user ---
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// GET user berdasarkan ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
       const user = results[0];
    res.json({
      message: 'data berhasil diambil!',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        jenis_kelamin: user.jenis_kelamin,
        foto_profil: user.foto_profil
      }
    });
  });
});

// login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi!' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Kesalahan server!' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah!' });
    }

    const user = results[0];
    res.json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        jenis_kelamin: user.jenis_kelamin,
        foto_profil: user.foto_profil
      }
    });
  });
});


// --- POST tambah user ---
app.post('/api/users', (req, res) => {

  console.log("Data diterima dari Android:", req.body);

  const { nama,email,password, jenis_kelamin,foto_profil
  } = req.body;


   if (!nama || !email || !password || !jenis_kelamin) {
    return res.status(400).json({ message: 'Semua field wajib diisi!' });
  }

  // Query SQL
  const sql = `
    INSERT INTO users (nama, email, password, jenis_kelamin, foto_profil)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Jalankan query
  db.query(sql, [nama, email, password, jenis_kelamin, foto_profil], (err, result) => {
    if (err) {
      console.error('Gagal menambahkan user:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: '✅ User berhasil ditambahkan!',
      id: result.insertId,
      data: {
        nama,
        email,
        jenis_kelamin,
        foto_profil: foto_profil || ''
      }
    });
  });
});

//update users
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { nama, email, password,  jenis_kelamin, foto_profil} = req.body;
  const sql = "UPDATE users SET nama = ?, email = ?, password =?, jenis_kelamin = ?, foto_profil =? WHERE id = ?";
  db.query(sql, [nama, email, password, jenis_kelamin,foto_profil , id], (err, result) => {
    if (err) throw err;
    res.json({ message: "User berhasil diperbarui" });
  });
});

//delete users
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: "User berhasil dihapus" });
  });
});

//====kelas====;
// GET semua kelas
app.get('/api/kelas', (req, res) => {
  const sql = 'SELECT * FROM kelas WHERE status = "aktif"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data kelas:', err);
      return res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
    res.json(results);
  });
});

//get kelas berdasarkan id
app.get("/api/kelas/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM kelas WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});

//tambah kelas baru

app.post('/api/kelas', (req, res) => {
  const { judul, deskripsi, id_users } = req.body;

  if (!judul || !deskripsi || !id_users) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const sql = `INSERT INTO kelas (judul, deskripsi, id_users, status) VALUES (?, ?, ?, 'aktif')`;
  db.query(sql, [judul, deskripsi, id_users], (err, result) => {
    if (err) {
      console.error('Gagal menyimpan kelas:', err);
      return res.status(500).json({ error: 'Gagal menyimpan kelas' });
    }

    res.json({
      message: 'Kelas berhasil disimpan',
      id: result.insertId,
    });
  });
});

// === GET semua kelas aktif ===
app.get('/api/kelas', (req, res) => {
  const sql = `
    SELECT 
      id,
      IFNULL(judul, 'Tanpa Judul') AS judul,
      IFNULL(deskripsi, 'Tidak ada deskripsi') AS deskripsi,
      IFNULL(id_users, '') AS id_users,
      IFNULL(status, 'tidak aktif') AS status
    FROM kelas
    WHERE status = 'aktif'
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data kelas:', err);
      return res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
    res.json(results);
  });
});



//edit kelas
app.put("/api/kelas/:id", (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, status } = req.body;
  const sql = `
    UPDATE kelas
    SET judul = ?, deskripsi = ?,  status = ?
    WHERE id = ?
  `;
  db.query(sql, [judul, deskripsi, status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Kelas berhasil diperbarui!" });
  });
});

// hapus kelas
app.delete("/api/kelas/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM kelas WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Kelas berhasil dihapus!" });
  });
});

//====pendaftran_kelas====;
//GET semua data pendaftaran_kelas
app.get("/api/pendaftaran_kelas", (req, res) => {
  const sql = "SELECT * FROM pendaftaran_kelas";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});
//GET berdasarkan ID
app.get("/api/pendaftaran_kelas/:id", (req, res) => {
  const sql = "SELECT * FROM pendaftaran_kelas WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json(result[0]);
  });
});

//POST (tambah data)
app.post("/api/pendaftaran_kelas", (req, res) => {
  const { id_kelas, id_users } = req.body;

  if (!id_kelas || !id_users) {
    return res.status(400).json({ message: "id_kelas dan id_users wajib diisi" });
  }

  const sql = `
    INSERT INTO pendaftaran_kelas (id_kelas, id_users)
    VALUES (?, ?)
  `;
  db.query(sql, [id_kelas, id_users], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({
      message: "Pendaftaran kelas berhasil ditambahkan",
      id: result.insertId,
    });
  });
});

//PUT (update data)
app.put("/api/pendaftran_kelas/:id", (req, res) => {
  const { id_kelas, id_users } = req.body;
  const sql = `
    UPDATE pendaftaran_kelas 
    SET id_kelas = ?, id_users = ? WHERE id = ?
  `;
  db.query(sql, [id_kelas, id_users, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ message: "Data berhasil diperbarui" });
  });
});

//DELETE (hapus data)
app.delete("/api/pendaftaran_kelas/:id", (req, res) => {
  const sql = "DELETE FROM pendaftaran_kelas WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ message: "Data berhasil dihapus" });
  });
});

// ================= MATERI =================
// GET semua data materi
app.get("/api/materi", (req, res) => {
  const sql = "SELECT * FROM materi ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// GET materi berdasarkan ID
app.get("/api/materi/:id", (req, res) => {
  const sql = "SELECT * FROM materi WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Materi tidak ditemukan" });
    res.json(result[0]);
  });
});

// POST tambah materi
app.post("/api/materi", (req, res) => {
  const { id_kelas, judul, tipe, video_url, file_url } = req.body;

  if (!id_kelas || !judul || !tipe) {
    return res
      .status(400)
      .json({ message: "id_kelas, judul, dan tipe wajib diisi" });
  }

  const sql = `
    INSERT INTO materi (id_kelas, judul, tipe, video_url, file_url)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [id_kelas, judul, tipe, video_url || null, file_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({
      message: "Materi berhasil ditambahkan",
      id: result.insertId,
    });
  });
});

// PUT update materi
app.put("/api/materi/:id", (req, res) => {
  const { id_kelas, judul, tipe, video_url, file_url } = req.body;

  const sql = `
    UPDATE materi
    SET id_kelas = ?, judul = ?, tipe = ?, video_url = ?, file_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.query(sql, [id_kelas, judul, tipe, video_url, file_url, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Materi tidak ditemukan" });
    res.json({ message: "Materi berhasil diperbarui" });
  });
});

// DELETE hapus materi
app.delete("/api/materi/:id", (req, res) => {
  const sql = "DELETE FROM materi WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Materi tidak ditemukan" });
    res.json({ message: "Materi berhasil dihapus" });
  });
});

// ================= KOMENTAR =================
// GET semua komentar
app.get("/api/komentar", (req, res) => {
  const sql = "SELECT * FROM komentar ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// GET komentar berdasarkan ID
app.get("/api/komentar/:id", (req, res) => {
  const sql = "SELECT * FROM komentar WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    res.json(result[0]);
  });
});

// GET komentar berdasarkan id_kelas
app.get("/api/komentar/kelas/:id_kelas", (req, res) => {
  const sql = "SELECT * FROM komentar WHERE id_kelas = ? ORDER BY created_at DESC";
  db.query(sql, [req.params.id_kelas], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// POST tambah komentar
app.post("/api/komentar", (req, res) => {
  const { id_kelas, id_users, komentar, rating } = req.body;

  if (!id_kelas || !id_users || !komentar) {
    return res
      .status(400)
      .json({ message: "id_kelas, id_users, komentar wajib diisi" });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ message: "Rating harus antara 1 - 10" });
  }

  const sql = `
    INSERT INTO komentar (id_kelas, id_users, komentar)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [id_kelas, id_users, komentar], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({
      message: "Komentar berhasil ditambahkan",
      id: result.insertId,
    });
  });
});

// PUT update komentar
app.put("/api/komentar/:id", (req, res) => {
  const { komentar, rating } = req.body;

  if (!komentar || !rating) {
    return res.status(400).json({ message: "komentar dan rating wajib diisi" });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ message: "Rating harus antara 1 - 10" });
  }

  const sql = `
    UPDATE komentar
    SET komentar = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.query(sql, [komentar, rating, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    res.json({ message: "Komentar berhasil diperbarui" });
  });
});

// DELETE hapus komentar
app.delete("/api/komentar/:id", (req, res) => {
  const sql = "DELETE FROM komentar WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    res.json({ message: "Komentar berhasil dihapus" });
  });
});


// Jalankan server
const PORT = 3000;
const HOST = '0.0.0.0'; // Dengarkan semua alamat, termasuk IP LAN

app.listen(PORT, HOST, () => {
  console.log(`✅ Server berjalan di http://${HOST}:${PORT}`);
});
