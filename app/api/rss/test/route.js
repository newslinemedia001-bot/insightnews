import { NextResponse } from 'next/server';
import { testAllFeeds } from '@/lib/rss-test';
import { DEFAULT_FEEDS } from '@/lib/rss';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET(request) {
    try {
        // Get feeds from database or use defaults
        const feedsRef = collection(db, 'rssFeeds');
        const feedsSnapshot = await getDocs(feedsRef);
        
        let feeds = [];
        if (feedsSnapshot.empty) {
            feeds = DEFAULT_FEEDS;
        } else {
            feeds = feedsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // Test all feeds
        const results = await testAllFeeds(feeds);
        
        // Group by category and status
        const summary = {
            total: results.length,
            working: results.filter(r => r.status === 'working').length,
            errors: results.filter(r => r.status === 'error').length,
            byCategory: {}
        };

        // Group results by category
        results.forEach(result => {
            if (!summary.byCategory[result.category]) {
                summary.byCategory[result.category] = {
                    total: 0,
                    working: 0,
                    errors: 0,
                    feeds: []
                };
            }
            
            summary.byCategory[result.category].total++;
            if (result.status === 'working') {
                summary.byCategory[result.category].working++;
            } else {
                summary.byCategory[result.category].errors++;
            }
            summary.byCategory[result.category].feeds.push(result);
        });

        return NextResponse.json({
            success: true,
            summary,
            results
        });

    } catch (error) {
        console.error('RSS Test Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}