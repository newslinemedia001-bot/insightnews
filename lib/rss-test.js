import Parser from 'rss-parser';

const parser = new Parser();

export async function testRssFeed(url, name) {
    try {
        console.log(`Testing ${name}: ${url}`);
        const feed = await parser.parseURL(url);
        
        return {
            name,
            url,
            status: 'working',
            itemCount: feed.items.length,
            title: feed.title,
            lastUpdated: feed.lastBuildDate || feed.pubDate,
            sampleItem: feed.items[0] ? {
                title: feed.items[0].title,
                pubDate: feed.items[0].pubDate,
                hasImage: !!(feed.items[0].enclosure || feed.items[0].mediaContent)
            } : null
        };
    } catch (error) {
        return {
            name,
            url,
            status: 'error',
            error: error.message
        };
    }
}

export async function testAllFeeds(feeds) {
    const results = [];
    
    for (const feed of feeds) {
        const result = await testRssFeed(feed.url, feed.name);
        results.push({
            ...result,
            category: feed.category,
            enabled: feed.enabled
        });
        
        // Add small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}