'use client';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function InvitusSeo({ title, description, content, slug, focusKeyword }) {
    const [score, setScore] = useState(0);
    const [results, setResults] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        analyzeSeo();
    }, [title, description, content, slug, focusKeyword]);

    const analyzeSeo = () => {
        // If no keyword, basic score is 0
        if (!focusKeyword) {
            setScore(0);
            setResults([]);
            return;
        }

        // Safety check for content
        const safeContent = content || '';
        const safeTitle = title || '';
        const safeDesc = description || '';
        const safeSlug = slug || '';

        const checks = [];
        let passedChecks = 0;
        const totalChecks = 6; // Simplified core checks for the main view

        const lowerKeyword = focusKeyword.toLowerCase();

        // Count words (stripping HTML)
        const textContent = safeContent.replace(/<[^>]*>/g, ' ');
        const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

        // Regex Helper
        const createRegex = (query) => {
            try {
                return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            } catch (e) { return null; }
        };
        const keywordRegex = createRegex(lowerKeyword);
        if (!keywordRegex) return;

        // 1. Title Check
        const titleHasKeyword = keywordRegex.test(safeTitle);
        checks.push({ label: 'Focus keyword in SEO Title', passed: titleHasKeyword });
        if (titleHasKeyword) passedChecks++;

        // 2. Desc Check
        const descHasKeyword = keywordRegex.test(safeDesc);
        checks.push({ label: 'Focus keyword in Meta Description', passed: descHasKeyword });
        if (descHasKeyword) passedChecks++;

        // 3. Slug Check
        const slugHasKeyword = keywordRegex.test(safeSlug.replace(/-/g, ' '));
        checks.push({ label: 'Focus keyword in URL', passed: slugHasKeyword });
        if (slugHasKeyword) passedChecks++;

        // 4. First Paragraph Check (Approx first 100 chars)
        const firstPara = textContent.substring(0, 200);
        const introHasKeyword = keywordRegex.test(firstPara);
        checks.push({ label: 'Focus keyword in first paragraph', passed: introHasKeyword });
        if (introHasKeyword) passedChecks++;

        // 5. Content Presence
        const contentHasKeyword = keywordRegex.test(textContent);
        checks.push({ label: 'Focus keyword in content', passed: contentHasKeyword });
        if (contentHasKeyword) passedChecks++;

        // 6. Content Length (Basic)
        const lengthCheck = wordCount >= 300;
        checks.push({ label: `Content length: ${wordCount} words (Recommended: 300+)`, passed: lengthCheck });
        if (lengthCheck) passedChecks++;


        // Calculate Score (Simple percentage for now)
        const finalScore = Math.round((passedChecks / totalChecks) * 100);
        setScore(finalScore);
        setResults(checks);
    };

    const getScoreColor = (s) => {
        if (s >= 80) return '#28a745'; // Green
        if (s >= 50) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
    };

    return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <div
                style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#fff' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>Invitus SEO</span>
                    {focusKeyword && (
                        <div style={{
                            width: '40px', height: '20px', borderRadius: '12px',
                            background: getScoreColor(score), color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                            {score}/100
                        </div>
                    )}
                </div>
                {isExpanded ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
            </div>

            {isExpanded && (
                <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    {!focusKeyword ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#dc3545', background: '#fff5f5', borderRadius: '4px', fontSize: '0.9rem' }}>
                            Please set a Focus Keyword to start analysis.
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', textAlign: 'center' }}>
                                {/* Mini Stats */}
                                {/* We could add generic stats here if we calculated them properly */}
                            </div>

                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>SEO Checklist</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {results.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                        <div style={{ marginRight: '10px', marginTop: '2px' }}>
                                            {item.passed ? (
                                                <CheckCircle size={16} color="#28a745" />
                                            ) : (
                                                <XCircle size={16} color="#dc3545" />
                                            )}
                                        </div>
                                        <span style={{ color: item.passed ? '#374151' : '#6b7280' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem', fontWeight: 'bold' }}>Improvement Suggestions</h4>
                                <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                                    Tip: Use the focus keyword naturally. Don't stuff it. Make sure your title is catchy!
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
