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
