import './RightSidebar.css';

export default function RightSidebar() {
    const trendingStories = [
        {
            title: "KJ-JEA placements: The good, the bad, and heartwarming moments of Grade 10...",
            category: "Family",
            time: "17 hours ago",
            image: "/images/news3.png"
        },
        {
            title: "Where are they now? Incredible career shifts of 23 high-flying graduates who...",
            category: "People",
            time: "17 hours ago"
        },
        {
            title: "Nandi: Outrage as CCTV captures police officer clobbering youths with batons...",
            category: "Counties",
            time: "an hour ago"
        },
        {
            title: "Jaridah Andayi shares cultural shock on prayers, religion in the US: \"Tread...\"",
            category: "Celebrities",
            time: "an hour ago"
        },
        {
            title: "Nairobi woman recounts final moments before stepdaughter was allegedly killed...",
            category: "Family",
            time: "2 hours ago"
        },
        {
            title: "Gates Foundation to layoff over 500 employees ahead of shutdown",
            category: "Economy",
            time: "an hour ago"
        },
        {
            title: "Kenya Power explains why some regions are currently without electricity",
            category: "Business",
            time: "2 hours ago"
        },
        {
            title: "Ruto nominates new members to the IEBC ahead of upcoming by-elections",
            category: "Politics",
            time: "3 hours ago"
        },
        {
            title: "Police launch manhunt for suspects who robbed supermarket in broad daylight",
            category: "Crime",
            time: "4 hours ago"
        },
        {
            title: "Central Bank of Kenya maintains base lending rate to curb inflation",
            category: "Economy",
            time: "5 hours ago"
        },
        {
            title: "Kenya Sevens qualifies for the 2026 World Cup after beating Namibia",
            category: "Sports",
            time: "6 hours ago"
        },
        {
            title: "Traffic snarl-up on Thika Road following truck breakdown near Roysambu",
            category: "Transport",
            time: "7 hours ago"
        },
        {
            title: "KRA targets small traders with new simplified tax system starting next month",
            category: "Economy",
            time: "8 hours ago"
        }
    ];

    return (
        <div className="right-sidebar-container">
            <div className="trending-header">
                <h3>TRENDING</h3>
            </div>

            <ul className="trending-stories-list">
                {trendingStories.map((story, index) => (
                    <li key={index} className="trending-story-item">
                        <a href="#">
                            {index === 0 && story.image && (
                                <div className="trending-image">
                                    <img src={story.image} alt={story.title} />
                                </div>
                            )}
                            <div className="trending-content">
                                {index === 0 && <span className="trending-badge breaking">BREAKING</span>}
                                <h4>{story.title}</h4>
                                <div className="trending-meta">
                                    <span className="trending-category">{story.category}</span>
                                    <span className="trending-time">{story.time}</span>
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
