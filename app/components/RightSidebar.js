import './RightSidebar.css';

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
}

export default function RightSidebar({ articles = [] }) {
    // Increase to 23 articles to match other columns (15 + 8 = 23)
    const displayArticles = articles.slice(0, 8);

    return (
        <div className="right-sidebar-container">
            <div className="trending-header">
                <h3>POLITICS</h3>
            </div>

            <ul className="trending-stories-list">
                {displayArticles.map((story, index) => (
                    <li key={story.id || index} className="trending-story-item">
                        <a href={`/${story.slug}`}>
                            {index === 0 && (story.image || story.featuredImage) && (
                                <div className="trending-image">
                                    <img src={story.image || story.featuredImage} alt={story.title} />
                                </div>
                            )}
                            <div className="trending-content">
                                {index === 0 && <span className="trending-badge breaking">TOP STORY</span>}
                                <h4>{story.title}</h4>
                                <div className="trending-meta">
                                    <span className="trending-category">{story.category}</span>
                                    <span className="trending-time">{formatDate(story.createdAt)}</span>
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
                {displayArticles.length === 0 && <li style={{ padding: '1rem' }}>No politics news yet.</li>}
            </ul>
        </div>
    );
}
