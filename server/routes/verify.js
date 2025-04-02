const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractClaims } = require('../utils/claimExtractor');
const { verifyClaims } = require('../services/factCheckService');
const { analyzeSource } = require('../utils/sourceAnalyzer');
const { parsePDF, parseDocx } = require('../utils/fileParser');

// Configure file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const validTypes = [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (validTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, TXT, and DOCX files are allowed'));
        }
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { url, text } = req.body;
        const file = req.file;
        
        if (!url && !text && !file) {
            return res.status(400).json({ error: 'Please provide a URL, text, or file' });
        }
        
        let content = text || '';
        
        // Process uploaded file
        if (file) {
            switch (file.mimetype) {
                case 'application/pdf':
                    content = await parsePDF(file.buffer);
                    break;
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    content = await parseDocx(file.buffer);
                    break;
                case 'text/plain':
                    content = file.buffer.toString('utf-8');
                    break;
            }
        }
        
        // Extract and verify claims
        const claims = extractClaims(content);
        const verifiedClaims = await verifyClaims(claims, url || '');
        const sourceAnalysis = analyzeSource(url);
        
        // Calculate weighted score
        const claimScores = verifiedClaims.map(c => c.score);
        const avgClaimScore = claimScores.length > 0 ? 
            claimScores.reduce((a, b) => a + b, 0) / claimScores.length : 0;
        
        const credibilityScore = Math.round(
            (sourceAnalysis.reliability * 0.6) + 
            (avgClaimScore * 0.4)
        );
        
        res.json({
            score: credibilityScore,
            claims: verifiedClaims,
            source: sourceAnalysis,
            content: content.substring(0, 1000) + (content.length > 1000 ? '...' : '')
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to verify content' 
        });
    }
});

module.exports = router;
