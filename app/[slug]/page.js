import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RightSidebar from '../components/RightSidebar';
import '../page.css'; // Reusing main page styles

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getItem(slug) {
    // 1. Check if it matches a category
    // Capitalize first letter to match DB convention (e.g. 'politics' -> 'Politics')
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const knownCategories = ['Politics', 'Business', 'Entertainment', 'People', 'Family', 'Crime', 'Sports', 'Lifestyle', 'Technology', 'Kenya', 'World', 'Opinion'];

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
        return { type: 'article', data: { id: doc.id, ...doc.data() } };
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
    return (
        <div className="site-wrapper">
            <Header />
            <main className="main-content">
                <div className="container">
                    {/* Full width article view, no sidebar */}
                    <div className="article-container" style={{ background: 'white', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{article.title}</h1>
                        <div className="article-meta" style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '1rem' }} className="author">By <strong>{article.author}</strong></span>
                            <span className="time">{formatDate(article.createdAt)}</span>
                            <span style={{ marginLeft: 'auto', background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{article.category}</span>
                        </div>

                        {article.image && (
                            <div className="article-featured-image" style={{ marginBottom: '2rem' }}>
                                <img src={article.image} alt={article.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '8px' }} />
                            </div>
                        )}

                        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} style={{ lineHeight: '1.8', fontSize: '1.15rem', color: '#1f2937' }} />

                        {/* Back Button */}
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                            <a href="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>&larr; Back to Home</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
