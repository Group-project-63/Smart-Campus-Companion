// server/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ---- CORS (allow your React dev origin)
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());

// ---- Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// ---- Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.\-() ]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Optional: limit to images & PDFs; increase limits if needed
const fileFilter = (req, file, cb) => {
  if (
    /^image\//.test(file.mimetype) ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ---- Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// ---- Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file received. Form field must be named "file".' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const fileUrl = `/uploads/${filename}`; // served statically below

    // Optionally: persist metadata in a JSONL file
    const metadata = {
      name: originalname,
      savedAs: filename,
      url: fileUrl,
      contentType: mimetype,
      size,
      uploadedAt: new Date().toISOString(),
    };
    fs.appendFileSync(path.join(uploadDir, 'metadata.jsonl'), JSON.stringify(metadata) + '\n');

    return res.status(200).json({ message: 'File uploaded successfully', file: metadata });
  } catch (err) {
    console.error('Upload server error:', err);
    return res.status(500).json({ error: 'Upload failed on server' });
  }
});

// ---- Serve uploads statically
app.use('/uploads', express.static(uploadDir));

// ---- Error handler for Multer (better messages)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'Unknown error' });
  }
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));