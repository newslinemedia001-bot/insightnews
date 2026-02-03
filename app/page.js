import Header from './components/Header';
import Footer from './components/Footer';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import './page.css';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

// Force dynamic rendering with caching for speed
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

async function getArticles() {
  const articlesRef = collection(db, 'articles');

  // 1. Fetch Layout Data in parallel for speed
  const breakingQ = query(articlesRef, where('isBreaking', '==', true), orderBy('createdAt', 'desc'), limit(1));
  const politicsQ = query(articlesRef, where('category', '==', 'Politics'), orderBy('createdAt', 'desc'), limit(10));
  const newsQ = query(articlesRef, where('category', '==', 'News'), orderBy('createdAt', 'desc'), limit(4));
  const businessQ = query(articlesRef, where('category', '==', 'Business'), orderBy('createdAt', 'desc'), limit(4));
  const sportsQ = query(articlesRef, where('category', '==', 'Sports'), orderBy('createdAt', 'desc'), limit(4));
  const entertainmentQ = query(articlesRef, where('category', '==', 'Entertainment'), orderBy('createdAt', 'desc'), limit(4));
  const lifestyleQ = query(articlesRef, where('category', '==', 'Lifestyle'), orderBy('createdAt', 'desc'), limit(4));
  const opinionQ = query(articlesRef, where('category', '==', 'Opinion'), orderBy('createdAt', 'desc'), limit(4));
  const latestQ = query(articlesRef, orderBy('createdAt', 'desc'), limit(20)); // For LeftSidebar + Text Grid

  const [breakingSnap, politicsSnap, newsSnap, businessSnap, sportsSnap, entertainmentSnap, lifestyleSnap, opinionSnap, latestSnap] = await Promise.all([
    getDocs(breakingQ),
    getDocs(politicsQ),
    getDocs(newsQ),
    getDocs(businessQ),
    getDocs(sportsQ),
    getDocs(entertainmentQ),
    getDocs(lifestyleQ),
    getDocs(opinionQ),
    getDocs(latestQ)
  ]);

  const mapDocs = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return {
    breakingNews: mapDocs(breakingSnap)[0],
    politicsNews: mapDocs(politicsSnap),
    newsArticles: mapDocs(newsSnap),
    businessNews: mapDocs(businessSnap),
    sportsNews: mapDocs(sportsSnap),
    entertainmentNews: mapDocs(entertainmentSnap),
    lifestyleNews: mapDocs(lifestyleSnap),
    opinionNews: mapDocs(opinionSnap),
    latestNews: mapDocs(latestSnap)
  };
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

export default async function Home() {
  const { breakingNews, politicsNews, newsArticles, businessNews, sportsNews, entertainmentNews, lifestyleNews, opinionNews, latestNews } = await getArticles();

  // If no manually set breaking news, fallback to the very first latest article
  const mainHero = breakingNews || latestNews[0];

  // For the center grid (Text Only), we want articles that are NOT the main hero
  // We filter out the main hero ID to avoid duplication
  const textGridStories = latestNews.filter(a => a.id !== mainHero?.id).slice(0, 5);

  // Review story (second hero feature) - typically the second latest
  const reviewStory = textGridStories[0]; // Logic can be improved, but this works for now
  const remainingGrid = textGridStories.slice(1);

  return (
    <div className="site-wrapper">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="three-column-layout">

            {/* 1. Header Line - Full Width */}
            <div className="breaking-news-header-span">
              <div className="green-line-header">
                <h2>KENYA BREAKING NEWS</h2>
              </div>
            </div>

            {/* 2. Black Hero Card */}
            {mainHero && (
              <div className="breaking-hero-span">
                <a href={`/${mainHero.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  <div className="breaking-hero">
                    <div className="breaking-hero-image">
                      <img src={mainHero.image || mainHero.featuredImage || "/images/placeholder.png"} alt={mainHero.title} />
                    </div>
                    <div className="breaking-hero-text">
                      <span className="breaking-badge">BREAKING</span>
                      <h3>{mainHero.title}</h3>
                      <p>{mainHero.description}</p>
                      <div className="hero-arrow-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* 3. Right Sidebar - POLITICS */}
            <aside className="right-sidebar">
              <RightSidebar articles={politicsNews} />
            </aside>

            {/* 4. Left Sidebar - LATEST */}
            <aside className="left-sidebar">
              <LeftSidebar articles={latestNews} />
            </aside>

            {/* 5. Center Content */}
            <div className="center-content">
              <section className="breaking-news-section">
                {/* Newspaper Reviews (Feature 2) */}
                {reviewStory && (
                  <a href={`/${reviewStory.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                    <div className="newspaper-reviews-section">
                      <img src={reviewStory.image || reviewStory.featuredImage || "/images/placeholder.png"} alt={reviewStory.title} />
                      <div className="review-content">
                        <h4>{reviewStory.title}</h4>
                        <p className="review-excerpt">{reviewStory.description}</p>
                        <div className="review-meta">
                          <span className="category">{reviewStory.category}</span>
                          <span className="time">{formatDate(reviewStory.createdAt)}</span>
                          <span className="author">By: {reviewStory.author}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                {/* Additional News Items - With Thumbnails */}
                <div className="news-grid">
                  {remainingGrid.map(story => (
                    <article key={story.id} className="news-item">
                      <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'contents' }}>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                        <div className="news-item-content">
                          <div className="news-meta">
                            <span className="category">{story.category}</span>
                            <span className="time">{formatDate(story.createdAt)}</span>
                            <span className="author">By: {story.author}</span>
                          </div>
                          <h4>{story.title}</h4>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* BELOW Hero Sections */}
          <div className="full-width-sections">
            {/* NEWS */}
            <section className="most-shared-section">
              <div className="green-line-header">
                <h2>NEWS</h2>
              </div>
              <div className="image-grid">
                {newsArticles.map((story, i) => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      {i === 0 && <span className="exclusive-badge">EXCLUSIVE</span>}
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="category">{story.category}</span>
                        <span className="time">{formatDate(story.createdAt)}</span>
                        <span className="author">By: {story.author}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {newsArticles.length === 0 && <p>No news stories yet.</p>}
              </div>
            </section>

            {/* BUSINESS */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>BUSINESS</h2>
              </div>
              <div className="image-grid">
                {businessNews.map((story, i) => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="category">{story.category}</span>
                        <span className="time">{formatDate(story.createdAt)}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {businessNews.length === 0 && <p>No business stories yet.</p>}
              </div>
            </section>

            {/* ENTERTAINMENT */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>ENTERTAINMENT</h2>
              </div>
              <div className="image-grid entertainment-grid">
                {entertainmentNews.map(story => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="category">{story.category}</span>
                        <span className="time">{formatDate(story.createdAt)}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {entertainmentNews.length === 0 && <p>No entertainment stories yet.</p>}
              </div>
            </section>

            {/* SPORTS */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>SPORTS</h2>
              </div>
              <div className="image-grid">
                {sportsNews.map(story => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="time">{formatDate(story.createdAt)}</span>
                        <span className="author">By: {story.author}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {sportsNews.length === 0 && <p>No sports stories yet.</p>}
              </div>
            </section>
            {/* LIFESTYLE */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>LIFESTYLE</h2>
              </div>
              <div className="image-grid">
                {lifestyleNews.map(story => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="time">{formatDate(story.createdAt)}</span>
                        <span className="author">By: {story.author}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {lifestyleNews.length === 0 && <p>No lifestyle stories yet.</p>}
              </div>
            </section>

            {/* OPINION */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>OPINION</h2>
              </div>
              <div className="image-grid">
                {opinionNews.map(story => (
                  <article key={story.id} className="image-article">
                    <a href={`/${story.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                      <div className="article-image-wrapper">
                        <div className="corner-ribbon"></div>
                        <img src={story.image || story.featuredImage || "/images/placeholder.png"} alt={story.title} />
                      </div>
                      <h4>{story.title}</h4>
                      <div className="article-meta">
                        <span className="time">{formatDate(story.createdAt)}</span>
                        <span className="author">By: {story.author}</span>
                      </div>
                    </a>
                  </article>
                ))}
                {opinionNews.length === 0 && <p>No opinion stories yet.</p>}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
