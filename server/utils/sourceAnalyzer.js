const SOURCE_DATABASE = {
    // News Sources
    'nytimes.com': { reliability: 92, bias: 'center' },
    'washingtonpost.com': { reliability: 90, bias: 'center-left' },
    'wsj.com': { reliability: 89, bias: 'center-right' },
    'reuters.com': { reliability: 94, bias: 'center' },
    'apnews.com': { reliability: 93, bias: 'center' },
    'bbc.com': { reliability: 91, bias: 'center' },
    
    // Fact-Checking Sites
    'factcheck.org': { reliability: 95, bias: 'neutral' },
    'snopes.com': { reliability: 94, bias: 'neutral' },
    'politifact.com': { reliability: 93, bias: 'neutral' },
    
    // Questionable Sources
    'blogspot.com': { reliability: 35, bias: 'unknown' },
    'wordpress.com': { reliability: 40, bias: 'unknown' },
    'medium.com': { reliability: 60, bias: 'unknown' }
};

function analyzeSource(url) {
    if (!url) return { reliability: 50, bias: 'unknown' };

    try {
        const domain = new URL(url).hostname.replace('www.', '');
        
        // Check for exact matches first
        if (SOURCE_DATABASE[domain]) {
            return SOURCE_DATABASE[domain];
        }
        
        // Check for partial matches (subdomains)
        for (const source in SOURCE_DATABASE) {
            if (domain.includes(source)) {
                return SOURCE_DATABASE[source];
            }
        }
        
        // Default for unknown sources
        return { 
            reliability: domain.endsWith('.gov') ? 85 : 
                       domain.endsWith('.edu') ? 80 : 50,
            bias: 'unknown' 
        };
    } catch (e) {
        return { reliability: 50, bias: 'unknown' };
    }
}

module.exports = { analyzeSource, SOURCE_DATABASE };
