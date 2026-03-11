'use client';
import { useState } from 'react';

export default function FixSlugsPage() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFix = async () => {
        setLoading(true);
        setStatus('Fixing articles...');
        
        try {
            const response = await fetch('/api/fix-slugs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_RSS_API_KEY || '8fcb0cec763622059af59b1b541af454ff06059e9195aaf0e5616633b4e1fd27'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setStatus(`✅ Success! Fixed ${result.fixed} articles, ${result.skipped} already had slugs.`);
            } else {
                const error = await response.json();
                setStatus(`❌ Error: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Fix Article Slugs</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                This tool will add missing slugs to all articles in your database. 
                Articles without slugs will show as "/undefined" in URLs.
            </p>

            <button
                onClick={handleFix}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Fixing...' : 'Fix All Articles'}
            </button>

            {status && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    color: status.includes('✅') ? '#155724' : '#721c24'
                }}>
                    {status}
                </div>
            )}

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>What this does:</h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>Scans all articles in the database</li>
                    <li>Generates slugs from article titles for articles missing slugs</li>
                    <li>Adds missing "image" and "description" fields for homepage compatibility</li>
                    <li>Does not modify articles that already have slugs</li>
                </ul>
            </div>
        </div>
    );
}
