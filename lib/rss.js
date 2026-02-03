import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['enclosure', 'enclosure'],
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator'],
        ],
    },
});

export const DEFAULT_FEEDS = [
    // --- NEWS ---
    {
        name: 'Capital FM News',
        url: 'https://www.capitalfm.co.ke/news/feed/',
        category: 'news',
        enabled: true
    },
    {
        name: 'The Star Kenya',
        url: 'https://www.the-star.co.ke/rss',
        category: 'news',
        enabled: true
    },
    {
        name: 'Standard Digital Headlines',
        url: 'https://www.standardmedia.co.ke/rss/headlines.php',
        category: 'news',
        enabled: true
    },
    {
        name: 'Kenyans.co.ke',
        url: 'https://www.kenyans.co.ke/feed/',
        category: 'news',
        enabled: true
    },
    {
        name: 'Citizen Digital',
        url: 'https://www.citizen.digital/rss',
        category: 'news',
        enabled: true
    },
    {
        name: 'K24 TV',
        url: 'https://www.k24tv.co.ke/feed/',
        category: 'news',
        enabled: true
    },

    // --- TECHNOLOGY ---
    {
        name: 'Techweez',
        url: 'https://techweez.com/feed/',
        category: 'technology',
        enabled: true
    },
    {
        name: 'Kachwanya',
        url: 'https://www.kachwanya.com/feed/',
        category: 'technology',
        enabled: true
    },
    {
        name: 'TechTrendsKe',
        url: 'https://techtrendske.co.ke/feed/',
        category: 'technology',
        enabled: true
    },
    {
        name: 'TechMoran',
        url: 'https://techmoran.com/feed/',
        category: 'technology',
        enabled: true
    },

    // --- BUSINESS ---
    {
        name: 'Capital FM Business',
        url: 'https://www.capitalfm.co.ke/business/feed/',
        category: 'business',
        enabled: true
    },
    {
        name: 'Standard Business',
        url: 'https://www.standardmedia.co.ke/rss/business.php',
        category: 'business',
        enabled: true
    },
    {
        name: 'Business Daily Africa',
        url: 'https://www.businessdailyafrica.com/bd/corporate/companies/rss',
        category: 'business',
        enabled: true
    },
    {
        name: 'The Star Business',
        url: 'https://www.the-star.co.ke/rss/business',
        category: 'business',
        enabled: true
    },

    // --- ENTERTAINMENT ---
    {
        name: 'Mpasho',
        url: 'https://mpasho.co.ke/feed/',
        category: 'entertainment',
        enabled: true
    },
    {
        name: 'Ghafla Kenya',
        url: 'http://www.ghafla.com/ke/feed/',
        category: 'entertainment',
        enabled: true
    },
    {
        name: 'Pulse Live Entertainment',
        url: 'https://www.pulselive.co.ke/entertainment/rss',
        category: 'entertainment',
        enabled: true
    },
    {
        name: 'Nairobi Wire',
        url: 'https://nairobiwire.com/feed/',
        category: 'entertainment',
        enabled: true
    },
    {
        name: 'Kiss 100',
        url: 'https://kiss100.co.ke/feed/',
        category: 'entertainment',
        enabled: true
    },

    // --- SPORTS ---
    {
        name: 'Capital FM Sports',
        url: 'https://www.capitalfm.co.ke/sports/feed/',
        category: 'sports',
        enabled: true
    },
    {
        name: 'Mozzart Sport Kenya',
        url: 'https://www.mozzartsport.co.ke/rss/news/featured',
        category: 'sports',
        enabled: true
    },
    {
        name: 'The Star Sports',
        url: 'https://www.the-star.co.ke/rss/sports',
        category: 'sports',
        enabled: true
    },
    {
        name: 'Standard Sports',
        url: 'https://www.standardmedia.co.ke/rss/sports.php',
        category: 'sports',
        enabled: true
    },

    // --- POLITICS ---
    {
        name: 'The Star Politics',
        url: 'https://www.the-star.co.ke/rss/news/politics',
        category: 'politics',
        enabled: true
    },
    {
        name: 'Standard Politics',
        url: 'https://www.standardmedia.co.ke/rss/politics.php',
        category: 'politics',
        enabled: true
    },
    {
        name: 'Capital FM Politics',
        url: 'https://www.capitalfm.co.ke/news/category/politics/feed/',
        category: 'politics',
        enabled: true
    },

    // --- LIFESTYLE ---
    {
        name: 'Capital FM Lifestyle',
        url: 'https://www.capitalfm.co.ke/lifestyle/feed/',
        category: 'lifestyle',
        enabled: true
    },
    {
        name: 'Standard Eve Woman',
        url: 'https://www.standardmedia.co.ke/rss/evewoman.php',
        category: 'lifestyle',
        enabled: true
    },
    {
        name: 'The Star Lifestyle',
        url: 'https://www.the-star.co.ke/rss/lifestyle',
        category: 'lifestyle',
        enabled: true
    },
    {
        name: 'Pulse Live Lifestyle',
        url: 'https://www.pulselive.co.ke/lifestyle/rss',
        category: 'lifestyle',
        enabled: true
    },

    // --- HEALTH ---
    {
        name: 'Standard Health & Science',
        url: 'https://www.standardmedia.co.ke/rss/health-science.php',
        category: 'health',
        enabled: true
    },
    {
        name: 'Capital FM Health',
        url: 'https://www.capitalfm.co.ke/news/category/health/feed/',
        category: 'health',
        enabled: true
    },
    {
        name: 'The Star Health',
        url: 'https://www.the-star.co.ke/rss/news/health',
        category: 'health',
        enabled: true
    }
];

// Helper to extract image from various possible sources
function extractImage(item) {
    // 1. Check media:content
    if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
    if (item.mediaContent?.url) return item.mediaContent.url;

    // 2. Check media:thumbnail
    if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
    if (item.mediaThumbnail?.url) return item.mediaThumbnail.url;

    // 3. Check enclosure
    if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
        return item.enclosure.url;
    }

    // 4. Check iTunes image (if podcast)
    if (item.itunes?.image) return item.itunes.image;

    // 5. Check content for first image
    const content = item.contentEncoded || item.content || '';
    const $ = cheerio.load(content);
    const firstImg = $('img').first().attr('src');
    if (firstImg) return firstImg;

    return null;
}

// Helper to clean and format content
function processContent(params) {
    const { content, link } = params;
    let cleanContent = sanitizeHtml(content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol', 'blockquote', 'h2', 'h3', 'h4'],
        allowedAttributes: {
            'a': ['href', 'target']
        },
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
        }
    });

    // Load into cheerio for structure fixes if needed
    const $ = cheerio.load(cleanContent);

    // Remove short paragraphs or empty ones
    $('p').each((i, elem) => {
        if ($(elem).text().trim().length < 50 && $(elem).find('img').length === 0) {
            // Check if it's not a caption or something useful
            // Optional: aggressive cleaning
        }
    });

    // Verify length
    if ($.text().length < 600) return null; // Too short

    // Add read more link
    const finalHtml = $.html() + `<p><i>Read more at <a href="${link}" target="_blank" rel="nofollow">original source</a>.</i></p>`;

    return finalHtml;
}

export async function importRssFeed(manualCategory = null) {
    const stats = {
        processed: 0,
        imported: 0,
        duplicates: 0,
        errors: 0,
        lastError: null,
        category: manualCategory || 'auto-rotated'
    };

    try {
        // 1. Determine Category and Feeds to process
        let categoryToImport = manualCategory;

        // Fetch feeds config from DB (or use defaults if empty)
        const feedsRef = collection(db, 'rssFeeds');
        let feedsSnapshot = await getDocs(feedsRef);

        let availableFeeds = [];
        if (feedsSnapshot.empty) {
            // Seed defaults if empty
            for (const feed of DEFAULT_FEEDS) {
                await addDoc(feedsRef, feed);
                availableFeeds.push(feed);
            }
        } else {
            availableFeeds = feedsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // Filter enabled feeds
        availableFeeds = availableFeeds.filter(f => f.enabled);

        if (!manualCategory) {
            // Rotation Logic
            const settingsRef = collection(db, 'settings');
            // Simplified rotation: Get distinct categories from available feeds, pick next one
            const categories = [...new Set(availableFeeds.map(f => f.category))];
            categoryToImport = categories[0]; // Fallback if no rotation state management yet
        }

        // Filter feeds for the target category
        const targetFeeds = availableFeeds.filter(f => f.category === categoryToImport);
        stats.category = categoryToImport;

        // 2. Process Feeds
        for (const feedConfig of targetFeeds) {
            try {
                const feed = await parser.parseURL(feedConfig.url);

                // Process top 5 items
                const itemsToProcess = feed.items.slice(0, 5);

                for (const item of itemsToProcess) {
                    stats.processed++;
                    try {
                        const title = item.title;
                        const link = item.link;
                        const pubDate = item.isoDate ? new Date(item.isoDate) : new Date();

                        // Check for duplicate by URL
                        const q = query(collection(db, 'articles'), where('sourceUrl', '==', link));
                        const duplicateCheck = await getDocs(q);

                        if (!duplicateCheck.empty) {
                            stats.duplicates++;
                            continue;
                        }

                        // Extract content and image
                        const content = item.contentEncoded || item.content || item.summary || '';
                        const processedHtml = processContent({ content, link });

                        if (!processedHtml) {
                            console.log(`Skipped too short: ${title}`);
                            continue; // Skip if quality check fails
                        }

                        const imageUrl = extractImage(item);

                        // Save to DB
                        await addDoc(collection(db, 'articles'), {
                            title: title,
                            content: processedHtml,
                            excerpt: item.contentSnippet?.substring(0, 150) + '...',
                            featuredImage: imageUrl || '/placeholder.jpg', // Fallback
                            category: feedConfig.category,
                            sourceUrl: link,
                            sourceName: feedConfig.name,
                            author: item.creator || item.author || 'RSS Feed',
                            status: 'published', // or 'draft' for review
                            createdAt: pubDate, // Use original date
                            importedAt: serverTimestamp(),
                            isRssImport: true
                        });

                        stats.imported++;

                    } catch (itemErr) {
                        console.error(`Error processing item ${item.title}:`, itemErr);
                        stats.errors++;
                        stats.lastError = itemErr.message;
                    }
                }

            } catch (feedErr) {
                console.error(`Error processing feed ${feedConfig.name}:`, feedErr);
                stats.errors++; // Feed level error
            }
        }

    } catch (e) {
        console.error("RSS Import Fatal Error:", e);
        throw e;
    }

    return stats;
}
