const express = require('express');
const authRouter = require('./AuthRouter');
const calendarRouter = require('./CalendarRouter');
const authMiddleware = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/calendars', authMiddleware, calendarRouter);

module.exports = router;