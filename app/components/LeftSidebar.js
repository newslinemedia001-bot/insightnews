import './LeftSidebar.css';

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
}

export default function LeftSidebar({ articles = [] }) {
    // Reduce articles to match middle column height
    const displayArticles = articles.slice(0, 5);

    return (
        <div className="left-sidebar-container">
            <div className="latest-header">
                <h3>LATEST</h3>
                <button className="refresh-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                </button>
            </div>

            <ul className="latest-stories-list">
                {displayArticles.map((story, index) => (
                    <li key={story.id || index} className="latest-story-item">
                        <a href={`/${story.slug}`}>
                            {index === 0 && (story.image || story.featuredImage) && (
                                <div className="story-image">
                                    <img src={story.image || story.featuredImage} alt={story.title} />
                                    <span className="story-badge">LATEST</span>
                                </div>
                            )}
                            <h4>{story.title}</h4>
                            <div className="story-meta">
                                <span className="story-category">{story.category}</span>
                                <span className="story-time">{formatDate(story.createdAt)}</span>
                            </div>
                        </a>
                    </li>
                ))}
                {displayArticles.length === 0 && <li style={{ padding: '1rem' }}>No articles yet.</li>}
            </ul>
        </div>
    );
}
