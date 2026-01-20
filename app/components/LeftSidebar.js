import './LeftSidebar.css';

export default function LeftSidebar() {
    const latestStories = [
        {
            title: "KCSE 2025: Student who missed exams due to spinal injury also KCSE after 10...",
            category: "Family",
            time: "4 minutes ago",
            image: "/images/news1.png"
        },
        {
            title: "Oga Obinna's 4th baby mama comes clean on why she removed family planning",
            category: "Celebration",
            time: "17 minutes ago"
        },
        {
            title: "A Guard Filmed My Friend Dancing With My Husband — I Protected Our Marriage and...",
            category: "Stories",
            time: "48 minutes ago"
        },
        {
            title: "My Husband Died Mid-Project — I Took Over His Business and Finished It Myself",
            category: "Stories",
            time: "an hour ago"
        },
        {
            title: "From Running Away at 10 to Being Pressured at 20 — I Cut My Mom Out of M...",
            category: "Stories",
            time: "an hour ago"
        },
        {
            title: "My Client Who Ghosted Me Came Back on My Worst Day: I Demanded Upfront Pay...",
            category: "Stories",
            time: "an hour ago"
        },
        {
            title: "I Took Illegal Shortcuts for My Boss — I Lost My Job When He Whistleblower...",
            category: "Stories",
            time: "an hour ago"
        },
        {
            title: "Village in shock as man kills wife, buries her in shallow grave inside their house",
            category: "Counties",
            time: "2 hours ago"
        },
        {
            title: "Nairobi woman arrested for allegedly killing her husband over remote control",
            category: "Counties",
            time: "3 hours ago"
        },
        {
            title: "Kenyans react after woman shares list of requirements for potential husband",
            category: "Social",
            time: "4 hours ago"
        }
    ];

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
                {latestStories.map((story, index) => (
                    <li key={index} className="latest-story-item">
                        <a href="#">
                            {index === 0 && story.image && (
                                <div className="story-image">
                                    <img src={story.image} alt={story.title} />
                                    <span className="story-badge">LATEST</span>
                                    <span className="play-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </span>
                                </div>
                            )}
                            <h4>{story.title}</h4>
                            <div className="story-meta">
                                <span className="story-category">{story.category}</span>
                                <span className="story-time">{story.time}</span>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
