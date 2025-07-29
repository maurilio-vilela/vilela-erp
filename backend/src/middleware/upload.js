const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, `uploads/tenant_${req.user.tenantId}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas arquivos PDF, JPG, JPEG e PNG são permitidos'));
  },
});

module.exports = upload;