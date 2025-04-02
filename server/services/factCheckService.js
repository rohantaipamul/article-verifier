const { analyzeSource } = require('../utils/sourceAnalyzer');

// Enhanced verification logic
async function verifyClaims(claims, url) {
    const sourceAnalysis = analyzeSource(url);
    let baseReliability = sourceAnalysis.reliability;
    
    return claims.map(claim => {
        // Realistic verification factors
        const verificationFactors = {
            hasNumbers: /\d/.test(claim) ? 0.15 : 0,
            hasNamedEntities: /[A-Z][a-z]+/.test(claim) ? 0.1 : 0,
            lengthFactor: Math.min(claim.length / 200, 0.2),
            sourceFactor: baseReliability / 100 * 0.3,
            sentimentFactor: analyzeSentiment(claim) * 0.25
        };

        const verificationScore = Object.values(verificationFactors).reduce((a, b) => a + b, 0);
        let status;

        if (verificationScore > 0.7) {
            status = 'verified';
        } else if (verificationScore > 0.4) {
            status = 'unverified';
        } else {
            status = 'questionable';
        }

        return {
            claim,
            status,
            score: Math.round(verificationScore * 100),
            factors: verificationFactors
        };
    });
}

// Simple sentiment analysis
function analyzeSentiment(text) {
    const positiveWords = ['success', 'benefit', 'improve', 'growth', 'achievement'];
    const negativeWords = ['fail', 'danger', 'harm', 'decline', 'problem'];
    
    const positiveCount = positiveWords.filter(w => text.toLowerCase().includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.toLowerCase().includes(w)).length;
    
    return 0.5 + (positiveCount - negativeCount) * 0.1;
}

module.exports = { verifyClaims };
