const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine dan direktori views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk parsing body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.render('index');
});

// API untuk kalkulasi
app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  
  try {
    // Gunakan Function dengan penambahan keamanan untuk evaluasi ekspresi matematika
    // eval() langsung tidak digunakan karena alasan keamanan
    const sanitizedExpression = expression
      .replace(/[^-()\d/*+.]/g, '') // Hanya izinkan karakter matematika
      .replace(/(\d+\.?\d*)/g, 'Number($1)'); // Konversi ke Number
    
    // Menggunakan Function untuk evaluasi yang lebih aman dari eval()
    const result = new Function(`return ${sanitizedExpression}`)();
    
    res.json({ result: result.toString() });
  } catch (error) {
    res.status(400).json({ error: 'Ekspresi tidak valid' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
}); 