import { NextResponse } from 'next/server';
import { importRssFeed } from '@/lib/rss';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const maxDuration = 60; // Set max duration for serverless function (optional, varies by platform)

export async function POST(request) {
    try {
        // 1. Authentication
        const apiKey = request.headers.get('x-api-key');
        const authHeader = request.headers.get('authorization');

        // You should store this securely in env vars
        const validApiKey = process.env.RSS_API_KEY;

        let isAuthenticated = false;
        if (apiKey === validApiKey) isAuthenticated = true;
        if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === validApiKey) isAuthenticated = true;

        if (!isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body (for manual mode)
        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Body might be empty
        }

        const manualCategory = body.category || null;

        // 3. Rotation Logic (if no manual category)
        let categoryToRun = manualCategory;

        if (!manualCategory) {
            // Get last rotation state
            const rotationRef = doc(db, 'settings', 'rssRotation');
            const rotationSnap = await getDoc(rotationRef);

            const rotationData = rotationSnap.exists() ? rotationSnap.data() : { lastCategory: null, allCategories: ['news', 'technology', 'business', 'lifestyle', 'entertainment', 'sports', 'politics', 'health'] };

            // Determine next category
            const allCats = rotationData.allCategories || ['news', 'technology', 'business'];
            const lastCat = rotationData.lastCategory;

            let nextIndex = 0;
            if (lastCat) {
                const lastIndex = allCats.indexOf(lastCat);
                if (lastIndex >= 0 && lastIndex < allCats.length - 1) {
                    nextIndex = lastIndex + 1;
                }
            }

            categoryToRun = allCats[nextIndex];

            // Update rotation state for NEXT time (optimistic update)
            await setDoc(rotationRef, {
                ...rotationData,
                lastCategory: categoryToRun,
                updatedAt: serverTimestamp()
            }, { merge: true });
        }

        // 4. Run Import
        console.log(`Starting RSS Import for category: ${categoryToRun}`);
        const stats = await importRssFeed(categoryToRun);

        return NextResponse.json({
            success: true,
            message: `Import completed for ${categoryToRun}`,
            stats
        });

    } catch (error) {
        console.error('RSS Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
