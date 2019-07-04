const express = require('express')
const router = express.Router();
const controller = require('./guest.controller');

router.get('/', controller.index);
router.get('/search', controller.search);
router.get('/:id', controller.show);
router.get('/:id/user', controller.getGuestbyUser);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;