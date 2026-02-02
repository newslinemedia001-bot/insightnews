import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RightSidebar from '../components/RightSidebar';
import '../page.css'; // Reusing main page styles
import './article.css'; // Article-specific styles

// Force dynamic rendering with caching
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

// Generate metadata for SEO
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const item = await getItem(slug);
    
    if (!item || item.type !== 'article') {
        return {
            title: 'Article Not Found',
            description: 'The article you are looking for does not exist.'
        };
    }
    
    const article = item.data;
    
    return {
        title: article.title,
        description: article.description || article.summary || article.title,
        keywords: article.tags ? article.tags.join(', ') : article.category,
        authors: [{ name: article.author }],
        openGraph: {
            title: article.title,
            description: article.description || article.summary,
            images: article.image ? [article.image] : [],
            type: 'article',
            publishedTime: article.createdAt ? new Date(article.createdAt.seconds * 1000).toISOString() : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description || article.summary,
            images: article.image ? [article.image] : [],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
    };
}

async function getItem(slug) {
    // 1. Check if it matches a category
    // Capitalize first letter to match DB convention (e.g. 'politics' -> 'Politics')
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const knownCategories = ['News', 'Politics', 'Business', 'Entertainment', 'People', 'Family', 'Crime', 'Sports', 'Lifestyle', 'Technology', 'World', 'Opinion'];

    if (knownCategories.includes(categoryName)) {
        // Fetch articles for this category
        const q = query(collection(db, 'articles'), where('category', '==', categoryName), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { type: 'category', data: articles, name: categoryName };
    }

    // 2. If not category, fetch article
    const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const articleData = { id: doc.id, ...doc.data() };
        
        // Fetch related articles from same category
        const relatedQ = query(
            collection(db, 'articles'), 
            where('category', '==', articleData.category),
            where('slug', '!=', slug),
            orderBy('slug'),
            orderBy('createdAt', 'desc'),
            limit(4)
        );
        const relatedSnapshot = await getDocs(relatedQ);
        const relatedArticles = relatedSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Fetch latest articles for "Read Also" links and sidebar
        const latestQ = query(
            collection(db, 'articles'),
            orderBy('createdAt', 'desc'),
            limit(15)
        );
        const latestSnapshot = await getDocs(latestQ);
        const latestArticles = latestSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(a => a.slug !== slug); // Exclude current article
        
        // Fetch opinion articles for sidebar (with error handling)
        let opinionArticles = [];
        try {
            const opinionQ = query(
                collection(db, 'articles'),
                where('category', '==', 'Opinion'),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const opinionSnapshot = await getDocs(opinionQ);
            opinionArticles = opinionSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.log('Opinion articles query failed, using latest instead');
            // Fallback to latest articles if Opinion query fails
            opinionArticles = latestArticles.slice(11, 16);
        }
        
        return { 
            type: 'article', 
            data: articleData,
            relatedArticles,
            latestArticles: latestArticles.slice(0, 6),
            sidebarLatest: latestArticles.slice(6, 11),
            opinionArticles
        };
    }

    return null;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
}

export default async function Page({ params }) {
    const { slug } = await params; // Await params in Next 15+
    const item = await getItem(slug);

    if (!item) {
        return (
            <div className="site-wrapper">
                <Header />
                <main className="container" style={{ padding: '2rem' }}>
                    <h1>404 - Not Found</h1>
                    <p>The content you are looking for does not exist.</p>
                </main>
                <Footer />
            </div>
        );
    }

    // RENDER CATEGORY PAGE
    if (item.type === 'category') {
        return (
            <div className="site-wrapper">
                <Header />
                <main className="main-content">
                    <div className="container">
                        <div className="green-line-header" style={{ marginBottom: '2rem' }}>
                            <h2>{item.name.toUpperCase()} NEWS</h2>
                        </div>

                        {/* Full width category list, no sidebar */}
                        <div className="category-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                            <div className="news-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
                                {item.data.length === 0 && <p>No articles in this category yet.</p>}
                                {item.data.map(story => (
                                    <article key={story.id} className="news-item" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        {story.image && (
                                            <img src={story.image} alt={story.title} style={{ width: '250px', height: '160px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                                        )}
                                        <div className="news-item-content" style={{ flex: 1 }}>
                                            <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>{story.title}</h3>
                                            </a>
                                            <p style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#555', lineHeight: '1.5' }}>{story.description}</p>
                                            <div className="news-meta">
                                                <span className="time" style={{ color: '#888', fontSize: '0.85rem' }}>{formatDate(story.createdAt)}</span>
                                                <span className="author" style={{ marginLeft: '1rem', color: '#888', fontSize: '0.85rem' }}>By: {story.author}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // RENDER ARTICLE PAGE
    const article = item.data;
    const relatedArticles = item.relatedArticles || [];
    const latestArticles = item.latestArticles || [];
    const sidebarLatest = item.sidebarLatest || [];
    const opinionArticles = item.opinionArticles || [];
    
    // Function to inject Read Also links into content
    function injectReadAlsoLinks(content, articles) {
        if (!articles || articles.length === 0) return content;
        
        // Split content into paragraphs
        const paragraphs = content.split('</p>');
        if (paragraphs.length < 4) return content; // Need at least 4 paragraphs
        
        // Calculate positions to insert links (roughly 1/4, 1/2, 3/4 through the article)
        const totalParas = paragraphs.length;
        const positions = [
            Math.floor(totalParas * 0.25),
            Math.floor(totalParas * 0.5),
            Math.floor(totalParas * 0.75)
        ];
        
        // Insert Read Also links at calculated positions
        positions.forEach((pos, idx) => {
            if (articles[idx] && pos < paragraphs.length) {
                const readAlsoLink = `<p class="inline-read-also-link"><strong>Read Also:</strong> <a href="/${articles[idx].slug}">${articles[idx].title}</a></p>`;
                paragraphs[pos] = paragraphs[pos] + '</p>' + readAlsoLink;
            }
        });
        
        return paragraphs.join('</p>');
    }
    
    // Inject Read Also links into article content
    const contentWithReadAlso = injectReadAlsoLinks(article.content, latestArticles.slice(0, 3));
    
    return (
        <div className="site-wrapper">
            <Header />
            <main className="main-content">
                <div className="container">
                    {/* Article with Sidebar Layout */}
                    <div className="article-with-sidebar">
                    <div className="article-container">
                        <h1 className="article-title">{article.title}</h1>
                        
                        {/* Summary Box */}
                        {article.summary && (
                            <div className="article-summary">
                                <p>{article.summary}</p>
                            </div>
                        )}
                        
                        <div className="article-meta">
                            <span className="author">By <strong>{article.author}</strong></span>
                            <span className="time">{formatDate(article.createdAt)}</span>
                            <span className="category-badge">{article.category}</span>
                        </div>

                        {article.image && (
                            <div className="article-featured-image">
                                <img src={article.image} alt={article.title} />
                            </div>
                        )}

                        {/* Article Content with injected Read Also links */}
                        <div className="article-body">
                            <div dangerouslySetInnerHTML={{ __html: contentWithReadAlso }} />
                        </div>

                        {/* Read Also Box at the end */}
                        {latestArticles.length > 3 && (
                            <div className="read-also-box-end">
                                <h3>Read Also</h3>
                                <ul>
                                    {latestArticles.slice(3, 6).map(a => (
                                        <li key={a.id}>
                                            <a href={`/${a.slug}`}>{a.title}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tags Section */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="article-tags">
                                <strong>Tags:</strong>
                                {article.tags.map(tag => (
                                    <span key={tag} className="tag-item">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Related Articles Section */}
                        {relatedArticles.length > 0 && (
                            <div className="related-articles-section">
                                <h2>RELATED ARTICLES</h2>
                                <div className="related-articles-grid">
                                    {relatedArticles.map(related => (
                                        <article key={related.id} className="related-article-card">
                                            <a href={`/${related.slug}`}>
                                                {related.image && (
                                                    <div className="related-article-image">
                                                        <img src={related.image} alt={related.title} />
                                                        <span className="related-category-badge">{related.category}</span>
                                                    </div>
                                                )}
                                                <div className="related-article-content">
                                                    <h3>{related.title}</h3>
                                                    <p>{related.description}</p>
                                                    <div className="related-meta">
                                                        <span className="time">{formatDate(related.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Back Button */}
                        <div className="back-button-container">
                            <a href="/" className="back-link">&larr; Back to Home</a>
                        </div>
                        </div>

                    {/* Right Sidebar */}
                    <aside className="article-sidebar">
                        {/* Latest Section */}
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">LATEST</h3>
                            <div className="sidebar-articles">
                                {sidebarLatest.map((latest) => (
                                    <article key={latest.id} className="sidebar-article">
                                        <a href={`/${latest.slug}`}>
                                            <div className="sidebar-article-content">
                                                <h4>{latest.title}</h4>
                                                <div className="sidebar-article-meta">
                                                    <span className="category">{latest.category}</span>
                                                    <span className="time">{formatDate(latest.createdAt)}</span>
                                                </div>
                                            </div>
                                        </a>
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* Trending/Opinion Section */}
                        <div className="sidebar-section" style={{ marginTop: '1.5rem' }}>
                            <h3 className="sidebar-title trending-title">TRENDING</h3>
                            <div className="sidebar-articles">
                                {opinionArticles.map((opinion) => (
                                    <article key={opinion.id} className="sidebar-article">
                                        <a href={`/${opinion.slug}`}>
                                            <div className="sidebar-article-content">
                                                <h4>{opinion.title}</h4>
                                                <div className="sidebar-article-meta">
                                                    <span className="category">{opinion.category}</span>
                                                    <span className="time">{formatDate(opinion.createdAt)}</span>
                                                </div>
                                            </div>
                                        </a>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
