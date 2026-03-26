import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit, orderBy } from 'firebase/firestore';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4'
    },
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
        name: 'Tuko News',
        url: 'https://www.tuko.co.ke/rss/',
        category: 'news',
        enabled: true
    },
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
        name: 'Reuters World',
        url: 'https://feeds.reuters.com/reuters/worldNews',
        category: 'world',
        enabled: true
    },
    {
        name: 'The Star World News',
        url: 'https://www.the-star.co.ke/rss/news/world',
        category: 'world',
        enabled: true
    },
    {
        name: 'Standard World News',
        url: 'https://www.standardmedia.co.ke/rss/world.php',
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

    const textLength = $.text().trim().length;

    // Require at least 30 characters of actual text to be meaningful
    if (textLength < 30) return null;

    // Add read more link (always — encourages click-through to original)
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
        skippedReasons: {
            political: 0,
            duplicate: 0,
            tooShort: 0,
            noImage: 0,
            feedError: 0
        },
        lastError: null,
        category: manualCategory || 'auto-rotated',
        authUid: auth.currentUser ? auth.currentUser.uid : 'not-signed-in',
        feedsProcessed: [],
        feedsWithErrors: []
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
            
            // Sync any new feeds from DEFAULT_FEEDS that are not in the DB
            for (const feed of DEFAULT_FEEDS) {
                if (!availableFeeds.some(f => f.url === feed.url)) {
                    console.log(`Adding new feed to DB: ${feed.name}`);
                    await addDoc(feedsRef, feed);
                    availableFeeds.push(feed);
                }
            }
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
                console.log(`Processing feed: ${feedConfig.name} (${feedConfig.url})`);
                const feed = await parser.parseURL(feedConfig.url);
                stats.feedsProcessed.push(feedConfig.name);

                // Process top 5 items
                const itemsToProcess = feed.items.slice(0, 5);
                console.log(`Found ${itemsToProcess.length} items in ${feedConfig.name}`);

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
                                stats.skippedReasons.political++;
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
                            stats.skippedReasons.duplicate++;
                            continue;
                        }

                        // Extract content and image
                        // Fall back through sources in order of richness
                        let rawContent = item.contentEncoded || item.content || item.summary || item.contentSnippet || '';

                        // If content is very short, try the summary as a fallback
                        if (rawContent.length < 100) {
                            rawContent = item.summary || item.contentSnippet || rawContent;
                        }

                        const processedHtml = processContent({ content: rawContent, link });

                        if (!processedHtml) {
                            console.log(`Skipped (no usable content): ${title}`);
                            stats.skipped++;
                            stats.skippedReasons.tooShort++;
                            continue; // Skip if truly empty
                        }

                        const imageUrl = extractImage(item);

                        // More lenient image check - allow articles without images for certain categories
                        const allowNoImage = ['opinion', 'politics', 'world'].includes(feedConfig.category);
                        if (!imageUrl && !allowNoImage) {
                            console.log(`Skipped due to missing image: ${title}`);
                            stats.skipped++;
                            stats.skippedReasons.noImage++;
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

                        // Generate slug from title
                        const slug = title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                            .replace(/\s+/g, '-') // Replace spaces with hyphens
                            .replace(/-+/g, '-') // Replace multiple hyphens with single
                            .substring(0, 100); // Limit length

                        const articleData = {
                            title: title || 'No Title',
                            slug: slug,
                            content: processedHtml,
                            excerpt: (item.contentSnippet || item.content || '').substring(0, 150) + '...',
                            featuredImage: imageUrl || null, // Use null, not undefined
                            image: imageUrl || null, // Add image field for homepage compatibility
                            description: (item.contentSnippet || item.content || '').substring(0, 150) + '...',
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
                stats.feedsWithErrors.push(`${feedConfig.name}: ${feedErr.message}`);
                stats.skippedReasons.feedError++;
            }
        }

    } catch (e) {
        console.error("RSS Import Fatal Error:", e);
        throw e;
    }

    return stats;
}
