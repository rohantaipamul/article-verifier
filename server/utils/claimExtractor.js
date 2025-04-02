const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

function extractClaims(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Basic text cleaning
    const cleanedText = text
        .replace(/[^\w\s.,!?']|_/g, '')
        .replace(/\s+/g, ' ');
    
    const sentences = tokenizer.tokenize(cleanedText);
    return sentences
        .filter(s => s.length > 20 && s.length < 500) // Reasonable claim length
        .slice(0, 10); // Limit to top 10 claims
}

module.exports = { extractClaims };
