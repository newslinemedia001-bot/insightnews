import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { db, auth } from './firebase';
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
    {
        name: 'Nairobi Wire',
        url: 'https://nairobiwire.com/feed/',
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
    },

    // --- WORLD ---
    {
        name: 'BBC News Africa',
        url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
        category: 'world',
        enabled: true
    },
    {
        name: 'Al Jazeera Africa',
        url: 'https://www.aljazeera.com/xml/rss/all.xml',
        category: 'world',
        enabled: true
    },
    {
        name: 'Reuters Africa',
        url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
        category: 'world',
        enabled: true
    },
    {
        name: 'The Star World News',
        url: 'https://www.the-star.co.ke/rss/news/world',
        category: 'world',
        enabled: true
    },

    // --- OPINION ---
    {
        name: 'Standard Opinion',
        url: 'https://www.standardmedia.co.ke/rss/opinion.php',
        category: 'opinion',
        enabled: true
    },
    {
        name: 'The Star Opinion',
        url: 'https://www.the-star.co.ke/rss/opinion',
        category: 'opinion',
        enabled: true
    },
    {
        name: 'Capital FM Opinion',
        url: 'https://www.capitalfm.co.ke/news/category/opinion/feed/',
        category: 'opinion',
        enabled: true
    },
    {
        name: 'Daily Nation Opinion',
        url: 'https://nation.africa/kenya/blogs-opinion/opinion/rss',
        category: 'opinion',
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
        skipped: 0,
        lastError: null,
        category: manualCategory || 'auto-rotated',
        authUid: auth.currentUser ? auth.currentUser.uid : 'not-signed-in'
    };

    try {
        console.log("Current Auth User:", auth.currentUser?.uid);

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

                        // SMART FILTER: Exclude Politics from Entertainment
                        if (feedConfig.category === 'entertainment') {
                            const politicalKeywords = ['Ruto', 'Tax', 'Parliament', 'Governor', 'President', 'Govt', 'Cabinet', 'CS ', 'Senator', 'MP ', 'Politics'];
                            const hasPolitics = politicalKeywords.some(keyword => title.includes(keyword));
                            if (hasPolitics) {
                                console.log(`Skipped political content in entertainment: ${title}`);
                                stats.skipped++;
                                continue;
                            }
                        }

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
                            stats.skipped++;
                            continue; // Skip if quality check fails
                        }

                        const imageUrl = extractImage(item);

                        // Skip if no valid image found (Better quality control)
                        if (!imageUrl || !imageUrl.startsWith('http')) {
                            console.log(`Skipped due to missing/invalid image: ${title}`);
                            stats.skipped++;
                            continue;
                        }

                        // Save to DB
                        // Prepare data and sanitize undefined -> null
                        // Map RSS category to proper case for consistency
                        const categoryMap = {
                            'news': 'News',
                            'politics': 'Politics',
                            'world': 'World',
                            'business': 'Business',
                            'entertainment': 'Entertainment',
                            'sports': 'Sports',
                            'lifestyle': 'Lifestyle',
                            'opinion': 'Opinion',
                            'technology': 'News', // Map technology to News
                            'health': 'Lifestyle' // Map health to Lifestyle
                        };

                        const articleData = {
                            title: title || 'No Title',
                            content: processedHtml,
                            excerpt: (item.contentSnippet || item.content || '').substring(0, 150) + '...',
                            featuredImage: imageUrl || null, // Use null, not undefined
                            category: categoryMap[feedConfig.category] || 'News',
                            sourceUrl: link || null,
                            sourceName: feedConfig.name || 'Unknown Source',
                            author: item.creator || item.author || 'RSS Feed',
                            status: 'published',
                            createdAt: pubDate,
                            importedAt: serverTimestamp(),
                            isRssImport: true
                        };

                        // Remove undefined keys or convert to null (Firestore validation fix)
                        Object.keys(articleData).forEach(key => {
                            if (articleData[key] === undefined) articleData[key] = null;
                        });

                        // Save to DB
                        await addDoc(collection(db, 'articles'), articleData);

                        stats.imported++;

                    } catch (itemErr) {
                        console.error(`Error processing item ${item.title}:`, itemErr);
                        stats.errors++;
                        stats.lastError = String(itemErr);
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
