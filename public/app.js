document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verificationForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        verifyBtn.disabled = true;
        loadingSpinner.classList.remove('d-none');

        const url = document.getElementById('articleUrl').value;
        const text = document.getElementById('articleText').value;
        const fileInput = document.getElementById('fileUpload');
        const file = fileInput.files[0];

        if (!url && !text && !file) {
            alert('Please provide either a URL, paste text, or upload a file');
            verifyBtn.disabled = false;
            loadingSpinner.classList.add('d-none');
            return;
        }

        const formData = new FormData();
        if (url) formData.append('url', url);
        if (text) formData.append('text', text);
        if (file) formData.append('file', file);

        try {
            const response = await fetch('/verify', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error verifying content. Please try again.');
        } finally {
            verifyBtn.disabled = false;
            loadingSpinner.classList.add('d-none');
        }
    });

    // File upload validation
    document.getElementById('fileUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                alert('Please upload only PDF, TXT, or DOCX files');
                e.target.value = '';
                return;
            }

            if (file.size > maxSize) {
                alert('File size exceeds 5MB limit');
                e.target.value = '';
            }
        }
    });
});

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const scoreElement = document.getElementById('score');
    const scoreBar = document.getElementById('scoreBar');
    const sourceRating = document.getElementById('sourceRating');
    const biasDetection = document.getElementById('biasDetection');
    const claimsList = document.getElementById('claimsList');

    // Display score
    scoreElement.textContent = data.score;
    scoreBar.style.width = `${data.score}%`;
    
    // Set color based on score
    if (data.score >= 80) {
        scoreBar.className = 'progress-bar bg-success';
        scoreElement.className = 'badge bg-success';
    } else if (data.score >= 60) {
        scoreBar.className = 'progress-bar bg-info';
        scoreElement.className = 'badge bg-info';
    } else if (data.score >= 40) {
        scoreBar.className = 'progress-bar bg-warning';
        scoreElement.className = 'badge bg-warning';
    } else {
        scoreBar.className = 'progress-bar bg-danger';
        scoreElement.className = 'badge bg-danger';
    }

    // Display source info
    const biasMap = {
        'center': 'Neutral',
        'center-left': 'Center-Left',
        'center-right': 'Center-Right',
        'left': 'Left-Leaning',
        'right': 'Right-Leaning',
        'neutral': 'Neutral',
        'unknown': 'Not Detected'
    };
    
    sourceRating.textContent = `${data.source.reliability}/100`;
    biasDetection.textContent = biasMap[data.source.bias] || 'Not Detected';

    // Display claims
    claimsList.innerHTML = '';
    data.claims.forEach(claim => {
        const li = document.createElement('li');
        li.className = `list-group-item ${claim.status}`;
        
        const claimText = document.createElement('p');
        claimText.className = 'claim-text mb-1';
        claimText.textContent = claim.claim;
        
        const statusBadge = document.createElement('span');
        statusBadge.className = 'badge rounded-pill float-end';
        
        if (claim.status === 'verified') {
            statusBadge.className += ' bg-success';
            statusBadge.textContent = `Verified (${claim.score}%)`;
        } else if (claim.status === 'unverified') {
            statusBadge.className += ' bg-warning';
            statusBadge.textContent = `Unverified (${claim.score}%)`;
        } else {
            statusBadge.className += ' bg-danger';
            statusBadge.textContent = `Questionable (${claim.score}%)`;
        }
        
        li.appendChild(claimText);
        li.appendChild(statusBadge);
        claimsList.appendChild(li);
    });
    
    resultsDiv.classList.remove('d-none');
    window.scrollTo({ top: resultsDiv.offsetTop, behavior: 'smooth' });
}