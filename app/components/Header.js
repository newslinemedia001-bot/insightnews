'use client';

import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            setSearchOpen(false);
            window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
        } else {
            // Show a brief alert or just do nothing
            alert('Please enter a search term');
        }
    };

    return (
        <>
            {/* Top Header */}
            <div className="top-header">
                <div className="container">
                    <div className="top-header-content">
                        <div className="logo">
                            <a href="/">
                                <img src="/insightnews.jpeg" alt="InsightNews" style={{ height: '100px', width: 'auto' }} />
                            </a>
                        </div>
                        <div className="award-badge">
                            <div className="badge-content">
                                <svg className="badge-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                </svg>
                                <span className="badge-text">BEST DIGITAL NEWS PLATFORM IN 2026</span>
                                <svg className="badge-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal - Always rendered but hidden with CSS */}
            {mounted && (
                <div className={`search-modal ${searchOpen ? 'open' : ''}`}>
                    <div className="search-modal-content">
                        <button className="search-close" onClick={() => setSearchOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={searchOpen}
                            />
                            <button type="submit">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="main-nav">
                <div className="container">
                    <ul className="nav-list">
                        <li className="nav-item active"><a href="/">HOME</a></li>
                        <li className="nav-item"><a href="/news">NEWS</a></li>
                        <li className="nav-item"><a href="/politics">POLITICS</a></li>
                        <li className="nav-item"><a href="/world">WORLD</a></li>
                        <li className="nav-item"><a href="/business">BUSINESS</a></li>
                        <li className="nav-item"><a href="/entertainment">ENTERTAINMENT</a></li>
                        <li className="nav-item"><a href="/sports">SPORTS</a></li>
                        <li className="nav-item"><a href="/lifestyle">LIFESTYLE</a></li>
                        <li className="nav-item"><a href="/opinion">OPINION</a></li>
                    </ul>
                </div>
            </nav>
        </>
    );
}
