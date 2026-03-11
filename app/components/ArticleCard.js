import './ArticleCard.css';

export default function ArticleCard({ article, featured = false }) {
    return (
        <article className={`article-card ${featured ? 'featured' : ''}`}>
            <div className="article-image">
                <img src={article.image} alt={article.title} />
                {article.badge && (
                    <span className="article-badge">{article.badge}</span>
                )}
            </div>
            <div className="article-content">
                <h3 className="article-title">
                    <a href={article.url}>{article.title}</a>
                </h3>
                {article.excerpt && (
                    <p className="article-excerpt">{article.excerpt}</p>
                )}
                <div className="article-meta">
                    {article.category && (
                        <span className="article-category">{article.category}</span>
                    )}
                    <span className="article-time">{article.time}</span>
                </div>
            </div>
        </article>
    );
}
