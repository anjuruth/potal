const multer = require('multer');
const path = require('path');
const fs = require('fs');

const mkdirIfNeeded = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/misc';
    if (file.fieldname === 'photo') folder = 'uploads/photos';
    else if (file.fieldname === 'certificate_file' || file.fieldname === 'certificate') folder = 'uploads/certificates';
    else if (file.fieldname === 'offer_letter') folder = 'uploads/offers';
    else if (file.fieldname === 'resume') folder = 'uploads/resumes';
    mkdirIfNeeded(path.join(__dirname, '..', folder));
    cb(null, path.join(__dirname, '..', folder));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images and documents are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = upload;
