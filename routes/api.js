require('dotenv').config();
const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * Fetches Domain Authority & PageRank Score using OpenPageRank API
 */
router.get('/domain-authority', async (req, res) => {
  const { domain } = req.query;
  if (!domain || domain.trim() === '') {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    console.log(`🔍 Fetching OpenPageRank data for: ${domain}`);

    const response = await axios.get(
      'https://openpagerank.com/api/v1.0/getPageRank',
      {
        headers: { 'API-OPR': process.env.OPENPAGERANK_API_KEY },
        params: { 'domains[]': [domain.trim()] }, // Send as an array
      }
    );

    console.log('✅ OpenPageRank API Response:', response.data);

    if (response.data.status_code !== 200) {
      return res.status(500).json({
        error: 'Failed to retrieve valid data from OpenPageRank',
        details: response.data,
      });
    }

    res.json(response.data.response[0]);
  } catch (error) {
    console.error(
      '❌ Error fetching OpenPageRank data:',
      error.response?.data || error.message
    );
    res.status(500).json({
      error: 'Failed to retrieve domain authority data',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
