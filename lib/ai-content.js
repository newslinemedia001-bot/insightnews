
import { GoogleGenerativeAI } from "@google/generative-ai";
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_FEEDS } from './rss';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// For text-only input, use the gemini-pro model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

// Helper to extract image from RSS item specifically
function extractImage(item) {
    if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
    if (item.mediaContent?.url) return item.mediaContent.url;
    if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
    if (item.mediaThumbnail?.url) return item.mediaThumbnail.url;
    if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) return item.enclosure.url;

    // Check content for first image
    // Also check description and summary as they often contain HTML with images
    const contentToCheck = [
        item.contentEncoded,
        item.content,
        item.description,
        item.summary
    ].filter(Boolean).join(' ');

    const $ = cheerio.load(contentToCheck);
    const firstImg = $('img').first().attr('src');
    if (firstImg) return firstImg;

    return null;
}

// Helper to fetch full content and extract image from the actual page
async function fetchPageDetails(url, selector) {
    try {
        console.log(`Fetching full content from: ${url}`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn(`Fetch failed for ${url}: ${response.status}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        let baseUrl = '';
        try {
            baseUrl = new URL(url).origin;
        } catch (e) { }

        // 1. Try to find the best image BEFORE removing elements
        // Check Metadata (Best Quality)
        let foundImage = $('meta[property="og:image"]').attr('content') ||
            $('meta[property="og:image:url"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('meta[name="twitter:image:src"]').attr('content') ||
            $('link[rel="image_src"]').attr('href');

        // Check JSON-LD if no meta image
        if (!foundImage) {
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const json = JSON.parse($(el).html());
                    if (json.image) {
                        if (typeof json.image === 'string') foundImage = json.image;
                        else if (json.image.url) foundImage = json.image.url;
                        else if (Array.isArray(json.image) && json.image[0]) foundImage = json.image[0];
                    }
                } catch (e) { /* ignore parse errors */ }
            });
        }

        // Fallback: Body Images
        if (!foundImage) {
            const likelyImages = $('article img, main img, .post-content img, body img');
            likelyImages.each((i, el) => {
                const src = $(el).attr('src');
                // Rudimentary check: skip SVGs, data, relative paths often fail but we'll take what we can get
                if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.startsWith('data:')) {
                    foundImage = src;
                    return false; // break loop
                }
            });
        }

        // Resolve relative URLs
        if (foundImage && foundImage.startsWith('/') && baseUrl) {
            foundImage = baseUrl + foundImage;
        }

        // 2. Clean Content
        $('script, style, iframe, nav, footer, header, .advertisement, .related-posts, .ob-widget, .comments').remove();

        let rawContent = '';
        if (selector && $(selector).length > 0) {
            rawContent = $(selector).html();
        } else {
            // Smart layout detection
            const article = $('article');
            if (article.length > 0) {
                rawContent = article.html();
            } else {
                rawContent = $('main').html() || $('.post-content').html() || $('.entry-content').html() || $('body').html();
            }
        }

        const cleanContent = rawContent ? sanitizeHtml(rawContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'ul', 'li']),
            allowedAttributes: {
                'a': ['href', 'target'],
                'img': ['src', 'alt']
            }
        }) : null;

        return {
            content: cleanContent,
            image: foundImage || null
        };

    } catch (error) {
        console.error(`Error fetching page details: ${error}`);
        return null;
    }
}

async function generateUniqueArticle(item, fullContent, category) {
    const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'News';
    const prompt = `
    You are an expert ${categoryName} journalist. Rewrite the following article to be completely unique, engaging, and optimized for a general audience.

    Requirements:
    1. Title: Create a catchy, click-worthy, SEO-friendly title (max 100 chars).
    2. Content: Rewrite the article content completely. Do not summarize; write a full article (at least 400 words).
    3. Style: Professional, informative, yet accessible. Avoid jargon where possible.
    4. Originality: pass plagiarism checks. Do not copy sentences.
    5. Formatting: Use HTML tags for structure: <p> for paragraphs, <h2> for subheadings, <ul>/<li> for lists.
    6. Constraints: Do NOT mention the original source (e.g., "The Verge reports..."). Present the news as direct reporting.
    7. Output Format: Return a VALID JSON object with keys "title" and "content". Do not include markdown formatting (like \`\`\`json) in the response.

    Original Title: ${item.title}
    Original Content:
    ${fullContent || item.contentEncoded || item.content || item.summary}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present (Gemini sometimes adds \`\`\`json ... \`\`\`)
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanText);
        } catch (parseError) {
            console.error("JSON Parse Error. Raw Text:", cleanText);
            return null;
        }

    } catch (error) {
        console.error("Error generating AI content:", error);
        return null;
    }
}

export async function generateFromAllSources(category = null) {
    console.log(`Starting AI Content Generation for category: ${category || 'All (Random)'}...`);

    let feedsToUse = DEFAULT_FEEDS;

    // Filter by category if provided, but map common categories
    if (category) {
        const targetCategory = category.toLowerCase();
        feedsToUse = DEFAULT_FEEDS.filter(f => f.category === targetCategory);

        if (feedsToUse.length === 0) {
            console.log(`No feeds found for category: ${category}. Using random selection.`);
            feedsToUse = DEFAULT_FEEDS;
        }
    }

    // Shuffle feeds to avoid bias
    const shuffledFeeds = feedsToUse.sort(() => 0.5 - Math.random());

    // Track stats for debugging
    const stats = {
        checked: 0,
        noImage: 0,
        duplicates: 0,
        fetchFailed: 0,
        genFailed: 0,
        generatedTitle: null
    };

    // Iterate through shuffled feeds until we successfully generate ONE article
    for (const feedConfig of shuffledFeeds) {
        try {
            console.log(`Checking feed: ${feedConfig.name}`);
            const feed = await parser.parseURL(feedConfig.url);

            // Generate article from ONE valid item
            // Check up to 10 items per feed to handle strict filters
            const itemsToProcess = feed.items.slice(0, 10);

            for (const item of itemsToProcess) {
                stats.checked++;

                // 2. Duplicate Check (Do this FIRST to save resources)
                const q = query(collection(db, 'articles'), where('sourceUrl', '==', item.link));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    stats.duplicates++;
                    continue;
                }

                // 1. Initial RSS Image Check
                let imageUrl = extractImage(item);
                let content = item.contentEncoded || item.content;

                // If NO image is found in RSS, OR content is short, fetch from source
                // This Aggressive Fallback fixes the "No Img" error for feeds that don't embed images
                if (!imageUrl || !content || content.length < 500) {
                    const pageDetails = await fetchPageDetails(item.link, feedConfig.selector);

                    if (pageDetails) {
                        if (pageDetails.image && !imageUrl) {
                            imageUrl = pageDetails.image; // Found image on page!
                        }
                        if (pageDetails.content && pageDetails.content.length > (content ? content.length : 0)) {
                            content = pageDetails.content; // Use better content
                        }
                    }
                }

                // Resolve relative URLs for RSS extracted images too
                if (imageUrl && imageUrl.startsWith('/')) {
                    try {
                        const baseUrl = new URL(feedConfig.url).origin;
                        imageUrl = baseUrl + imageUrl;
                    } catch (e) { }
                }

                // Final Validations
                if (!imageUrl) {
                    // console.log(`Skipping ${item.title} - No image found (even after fetch).`);
                    stats.noImage++;
                    continue; // Skip this item
                }

                if (!content || content.length < 300) {
                    console.log("Skipping - Could not retrieve sufficient content.");
                    stats.fetchFailed++;
                    continue; // Skip this item
                }

                console.log(`Found suitable candidate: ${item.title}`);

                // 4. Generate AI Article
                console.log("Generating AI rewrite...");
                const generated = await generateUniqueArticle(item, content, feedConfig.category);

                if (!generated || !generated.title || !generated.content) {
                    console.log("Failed to generate valid article.");
                    stats.genFailed++;
                    continue; // Try next item
                }

                // 5. Save to DB
                const slug = generated.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .substring(0, 100);

                // Map Category for Display
                const categoryMap = {
                    'news': 'News',
                    'politics': 'Politics',
                    'world': 'World',
                    'business': 'Business',
                    'entertainment': 'Entertainment',
                    'sports': 'Sports',
                    'lifestyle': 'Lifestyle',
                    'opinion': 'Opinion',
                    'technology': 'Technology',
                    'health': 'Health'
                };

                const displayCategory = categoryMap[feedConfig.category] || 'News';

                const articleData = {
                    title: generated.title,
                    slug: slug,
                    content: generated.content,
                    excerpt: generated.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...',
                    featuredImage: imageUrl,
                    image: imageUrl,
                    description: generated.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...',
                    category: displayCategory,
                    sourceUrl: item.link,
                    sourceName: 'AI Generated (via ' + feedConfig.name + ')',
                    author: 'InsightNews AI',
                    status: 'published',
                    createdAt: new Date(),
                    importedAt: serverTimestamp(),
                    isAiGenerated: true
                };

                await addDoc(collection(db, 'articles'), articleData);
                console.log(`Successfully generated and saved: ${articleData.title}`);
                stats.generatedTitle = articleData.title;

                return { success: true, title: articleData.title, stats };
            }
        } catch (feedError) {
            console.error(`Error processing feed ${feedConfig.name}:`, feedError);
            continue; // Try next feed
        }
    }

    return {
        success: false,
        message: `No suitable articles found. Checked ${stats.checked} items. (No Img: ${stats.noImage}, Dups: ${stats.duplicates}, FetchFail: ${stats.fetchFailed}, GenFail: ${stats.genFailed})`,
        stats
    };
}
