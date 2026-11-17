// Quick script to fix article slugs
// Run with: node fix-slugs.js

const API_KEY = process.env.RSS_API_KEY || 'your-api-key-here'; // Replace
const API_URL = 'http://localhost:3000/api/fix-slugs'; // Change to your domain if deployed

fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
})
.then(res => res.json())
.then(data => {
    console.log('✅ Success!');
    console.log(`Fixed: ${data.fixed} articles`);
    console.log(`Skipped: ${data.skipped} articles (already had slugs)`);
})
.catch(err => {
    console.error('❌ Error:', err.message);
});
