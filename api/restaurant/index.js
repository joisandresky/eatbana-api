const express = require('express')
const router = express.Router();
const controller = require('./restaurant.controller');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({
  storage: storage, limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


router.get('/', controller.index);
router.get('/search', controller.search);
router.get('/nearby', controller.nearby);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/findCriteria', controller.findWithFormula);
router.post('/upload', upload.single('image'), function (req, res) {
  if (req.file) {
    return res.status(200).json({ success: true, message: 'Image Uploaded', result: req.file });
  } else {
    return res.status(400).json({ success: false, message: 'Image not Uploaded!', result: req.file });
  }
});

router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;