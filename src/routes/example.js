const express = require('express');
const router = express.Router();
const ResponseHelper = require('../utils/response');
const { authenticateJWT } = require('../middleware/auth');

// Public example endpoint
router.get('/test', (req, res) => {
    return ResponseHelper.success(res, { message: 'API is working' });
});

// Protected example: returns token payload as user
router.get('/me', authenticateJWT, (req, res) => {
    const user = req.user || null;
    return ResponseHelper.success(res, { user });
});

module.exports = router;
const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Example: GET all records from a table
// router.get('/', async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('your_table_name')
//       .select('*');
//
//     if (error) throw error;
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Example: POST a new record
// router.post('/', async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('your_table_name')
//       .insert([req.body])
//       .select();
//
//     if (error) throw error;
//     res.status(201).json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
