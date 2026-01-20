import Header from './components/Header';
import Footer from './components/Footer';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import './page.css';

export default function Home() {
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

            {/* 2. Black Hero Card - Spans Left and Middle Columns */}
            <div className="breaking-hero-span">
              <div className="breaking-hero">
                <div className="breaking-hero-image">
                  <img src="/images/news1.png" alt="Breaking News" />
                </div>
                <div className="breaking-hero-text">
                  <span className="breaking-badge">BREAKING</span>
                  <h3>Ugandan Elections: Yoweri Museveni takes early lead in presidential election</h3>
                  <p>President Yoweri Museveni of Uganda garnered 74,325 votes in 133 polling stations to be declared as taking the early lead in the presidential election.</p>
                  <div className="hero-arrow-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Right Sidebar - Stays on the right, spans down */}
            <aside className="right-sidebar">
              <RightSidebar />
            </aside>

            {/* 4. Left Sidebar - Under the black card */}
            <aside className="left-sidebar">
              <LeftSidebar />
            </aside>

            {/* 5. Center Content - Under the black card */}
            <div className="center-content">
              <section className="breaking-news-section">
                {/* Newspaper Reviews */}
                <div className="newspaper-reviews-section">
                  <img src="/images/news2.png" alt="Kenyan Newspapers" />
                  <div className="review-content">
                    <h4>Kenyan newspapers review: Cracks emerge in Rigathi Gachagua's camp as MPs allies dump ex-DP</h4>
                    <p className="review-excerpt">On Friday, January 16, the Kenyan newspapers highlighted emerging divisions in ex-DP Rigathi Gachagua's political camp, as several MPs and allies defected from DP.</p>
                    <div className="review-meta">
                      <span className="category">Politics</span>
                      <span className="time">2 hours ago</span>
                      <span className="author">By: Japhet Ruto</span>
                    </div>
                  </div>
                </div>

                {/* Additional News Items - Text Based */}
                <div className="news-grid">
                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Business and Economy</span>
                        <span className="time">an hour ago</span>
                        <span className="author">By: Japhet Ruto</span>
                      </div>
                      <h4>Donald Trump exempts Kenya from US visa crackdown impacting 75 countries</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Celebrities</span>
                        <span className="time">2 hours ago</span>
                        <span className="author">By: William Osoro</span>
                      </div>
                      <h4>Rose Muhando: Drama as singer denies getting married to Kenyan preacher Robert Lumaasi</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <span className="exclusive-badge">EXCLUSIVE</span>
                      <div className="news-meta">
                        <span className="category">Education</span>
                        <span className="time">18 hours ago</span>
                        <span className="author">By: Nancy Odindo</span>
                      </div>
                      <h4>Nairobi: Grade 10 student with disability depressed after Lenana School allegedly rejects him</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <span className="exclusive-badge">EXCLUSIVE</span>
                      <div className="news-meta">
                        <span className="category">Family</span>
                        <span className="time">21 hours ago</span>
                        <span className="author">By: Susan Musonye</span>
                      </div>
                      <h4>Robert Matano: Celebrated Kenyan football coach loses his wife, daughter shares cause of death</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Business</span>
                        <span className="time">an hour ago</span>
                        <span className="author">By: Japhet Ruto</span>
                      </div>
                      <h4>Kenya Airways resumes flights to Mogadishu after 10 years of suspension</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Legal</span>
                        <span className="time">5 hours ago</span>
                        <span className="author">By: Peter Kinuthia</span>
                      </div>
                      <h4>High Court suspends implementation of new housing levy pending full hearing</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Education</span>
                        <span className="time">6 hours ago</span>
                        <span className="author">By: Mercy Chebet</span>
                      </div>
                      <h4>University students announce nationwide protest over new funding model delays</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Health</span>
                        <span className="time">7 hours ago</span>
                        <span className="author">By: Japhet Ruto</span>
                      </div>
                      <h4>Ministry of Health confirms 10 cases of rare respiratory illness in coastal region</h4>
                    </div>
                  </article>

                  <article className="news-item text-only">
                    <div className="news-item-content">
                      <div className="news-meta">
                        <span className="category">Lifestyle</span>
                        <span className="time">8 hours ago</span>
                        <span className="author">By: Peter Kinuthia</span>
                      </div>
                      <h4>Nairobi's weekend guide: Top 5 hidden gems to visit this Saturday</h4>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </div>

          {/* BELOW Hero Sections - Full Width Horizontal Balance */}
          <div className="full-width-sections">
            {/* MOST SHARED - Image Grid */}
            <section className="most-shared-section">
              <div className="green-line-header">
                <h2>MOST SHARED</h2>
              </div>
              <div className="image-grid">
                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news1.png" alt="News" />
                  </div>
                  <span className="exclusive-badge">EXCLUSIVE</span>
                  <h4>KJ-JEA placement: Githurai boy who showed up with bag and blanket during admission sent away</h4>
                  <div className="article-meta">
                    <span className="category">Family</span>
                    <span className="time">20 hours ago</span>
                    <span className="author">By: Hillary Lisimba</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news2.png" alt="News" />
                  </div>
                  <h4>Kenyans comfort girl who survived crash that killed her family as heartbreaking photos of her trend</h4>
                  <div className="article-meta">
                    <span className="category">Family</span>
                    <span className="time">a day ago</span>
                    <span className="author">By: Lynn Oliver Kitolai</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news3.png" alt="News" />
                  </div>
                  <span className="exclusive-badge">BREAKING</span>
                  <h4>Heartbreak as Kawangware man who underwent 2 surgeries after tooth extraction by fake dentist dies</h4>
                  <div className="article-meta">
                    <span className="category">People</span>
                    <span className="time">18 hours ago</span>
                    <span className="author">By: Lynn Oliver Kitolai</span>
                  </div>
                </article>
              </div>
            </section>

            {/* ENTERTAINMENT - Image Grid */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>ENTERTAINMENT</h2>
              </div>
              <div className="image-grid entertainment-grid">
                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news4.png" alt="News" />
                  </div>
                  <h4>Baba Levo: Questions as singer buys wife Ksh 10m Range Rover months after becoming MP</h4>
                  <div className="article-meta">
                    <span className="category">Celebrities</span>
                    <span className="time">2 hours ago</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news1.png" alt="News" />
                  </div>
                  <h4>Gloria Ntazola claims her ex-boyfriend financed her cosmetic procedures</h4>
                  <div className="article-meta">
                    <span className="category">Celebrities</span>
                    <span className="time">3 hours ago</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news2.png" alt="News" />
                  </div>
                  <h4>Baby Top: Kenyans awed by presenter's flawless makeup-free face</h4>
                  <div className="article-meta">
                    <span className="category">Celebrities</span>
                    <span className="time">4 hours ago</span>
                  </div>
                </article>
              </div>
            </section>

            {/* PEOPLE - Image Grid */}
            <section className="category-image-grid-section">
              <div className="green-line-header">
                <h2>PEOPLE</h2>
              </div>
              <div className="image-grid">
                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news3.png" alt="News" />
                  </div>
                  <h4>Viral this week: Nairobi teen who flew on KQ scores A in KCSE, sponsored Meru boy scores A</h4>
                  <div className="article-meta">
                    <span className="time">2 hours ago</span>
                    <span className="author">By: Susan Musonye</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news4.png" alt="News" />
                  </div>
                  <h4>Nandi girl admitted to Kapsabet Girls after walking for 10km to school: "I came alone"</h4>
                  <div className="article-meta">
                    <span className="time">4 hours ago</span>
                    <span className="author">By: John Green</span>
                  </div>
                </article>

                <article className="image-article">
                  <div className="article-image-wrapper">
                    <div className="corner-ribbon"></div>
                    <img src="/images/news1.png" alt="News" />
                  </div>
                  <h4>Grade 10 admission: Girl who scored 40 points on brink of losing Alliance Girls spot, seeks help</h4>
                  <div className="article-meta">
                    <span className="time">5 hours ago</span>
                    <span className="author">By: John Green</span>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
