const express = require('express');
const router = express.Router();

// Root API route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DrawMaster Hub API is running'
  });
});

module.exports = router;
