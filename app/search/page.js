import Header from '../components/Header';
import Footer from '../components/Footer';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import '../page.css';

export const dynamic = 'force-dynamic';

async function searchArticles(searchQuery) {
  if (!searchQuery) return [];
  
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };
  
  // Client-side filtering with better search
  const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return allArticles.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const excerpt = (article.excerpt || '').toLowerCase();
    const content = stripHtml(article.content || '').toLowerCase();
    const category = (article.category || '').toLowerCase();
    const author = (article.author || '').toLowerCase();
    const sourceName = (article.sourceName || '').toLowerCase();
    
    // Combine all searchable text
    const searchableText = `${title} ${description} ${excerpt} ${content} ${category} ${author} ${sourceName}`;
    
    // Check if any search term matches
    return searchTerms.some(term => searchableText.includes(term));
  });
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return date.toLocaleDateString();
}

export default async function SearchPage({ searchParams }) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  const searchQuery = params?.q || '';
  const trimmedQuery = searchQuery.trim();
  const results = trimmedQuery ? await searchArticles(trimmedQuery) : [];

  return (
    <div className="site-wrapper">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div style={{ padding: '2rem 0' }}>
            {trimmedQuery ? (
              <>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                  Search Results for: "{trimmedQuery}"
                </h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Found {results.length} article{results.length !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                  Search Articles
                </h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Please enter a search term to find articles
                </p>
              </>
            )}

            {results.length > 0 ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {results.map(article => (
                  <article key={article.id} style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}>
                    <a href={`/${article.slug}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                      {article.image && (
                        <img 
                          src={article.image} 
                          alt={article.title}
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#666', 
                          marginBottom: '0.5rem',
                          display: 'flex',
                          gap: '1rem'
                        }}>
                          <span style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>
                            {article.category}
                          </span>
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <h3 style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          lineHeight: '1.4'
                        }}>
                          {article.title}
                        </h3>
                        <p style={{ 
                          color: '#444', 
                          fontSize: '0.9rem',
                          lineHeight: '1.5'
                        }}>
                          {article.description}
                        </p>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            ) : trimmedQuery ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                color: '#666'
              }}>
                <p>No articles found matching your search.</p>
                <p style={{ marginTop: '1rem' }}>Try different keywords or browse our categories.</p>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                color: '#666'
              }}>
                <p>Use the search box above to find articles.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
