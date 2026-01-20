import './Header.css';

export default function Header() {
    return (
        <>
            {/* Top Header */}
            <div className="top-header">
                <div className="container">
                    <div className="top-header-content">
                        <div className="logo">
                            <h1>INSIGHTNEWS</h1>
                        </div>
                        <div className="award-badge">
                            <span className="badge-text">BEST DIGITAL NEWS PLATFORM IN 2026</span>
                        </div>
                        <div className="search-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="main-nav">
                <div className="container">
                    <ul className="nav-list">
                        <li className="nav-item active"><a href="/">HOME</a></li>
                        <li className="nav-item"><a href="/politics">POLITICS</a></li>
                        <li className="nav-item"><a href="/kenya">KENYA</a></li>
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
