import './Sidebar.css';

export default function Sidebar() {
    const latestNews = [
        { title: "Breaking: Major political development in Kenya", category: "Politics", time: "2 hours ago" },
        { title: "Entertainment star announces new project", category: "Entertainment", time: "3 hours ago" },
        { title: "Sports: Team wins championship match", category: "Sports", time: "4 hours ago" },
        { title: "Business leader shares economic insights", category: "Business", time: "5 hours ago" },
        { title: "Lifestyle trends gaining popularity", category: "Lifestyle", time: "6 hours ago" },
        { title: "Technology innovation announced", category: "Tech", time: "7 hours ago" },
        { title: "World news update from international summit", category: "World", time: "8 hours ago" },
    ];

    const trending = [
        "Top story making headlines today",
        "Celebrity news trending nationwide",
        "Economic forecast for next quarter",
        "Sports achievement breaking records",
        "Political debate gaining attention",
    ];

    return (
        <aside className="sidebar">
            {/* Latest News Section */}
            <div className="sidebar-section">
                <div className="sidebar-header">
                    <h3>LATEST</h3>
                </div>
                <ul className="latest-news-list">
                    {latestNews.map((item, index) => (
                        <li key={index} className="latest-news-item">
                            <a href="#">
                                <div className="latest-news-content">
                                    <span className="latest-category">{item.category}</span>
                                    <span className="latest-time">{item.time}</span>
                                </div>
                                <h4 className="latest-title">{item.title}</h4>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Trending Section */}
            <div className="sidebar-section trending-section">
                <div className="sidebar-header trending-header">
                    <h3>TOP STORIES</h3>
                </div>
                <ol className="trending-list">
                    {trending.map((item, index) => (
                        <li key={index} className="trending-item">
                            <a href="#">
                                <span className="trending-number">{index + 1}</span>
                                <span className="trending-text">{item}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Ad Space */}
            <div className="sidebar-section ad-section">
                <div className="ad-placeholder">
                    <p>Advertisement</p>
                </div>
            </div>
        </aside>
    );
}
