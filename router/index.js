const express = require('express');
const authRouter = require('./AuthRouter');
const calendarRouter = require('./CalendarRouter');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/calendar', calendarRouter);

module.exports = router;