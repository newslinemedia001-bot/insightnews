import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const maxDuration = 60;

export async function POST(request) {
    try {
        // Authentication
        const apiKey = request.headers.get('x-api-key');
        const validApiKey = process.env.RSS_API_KEY;

        if (apiKey !== validApiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Sign in anonymously for Firestore rules
        try {
            await signInAnonymously(auth);
        } catch (authError) {
            console.error("Auth Error:", authError);
        }

        // Get all articles
        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(articlesRef);

        let fixed = 0;
        let skipped = 0;

        for (const docSnap of snapshot.docs) {
            const article = docSnap.data();
            
            // Check if slug is missing or undefined
            if (!article.slug) {
                const title = article.title || 'untitled';
                
                // Generate slug from title
                const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .substring(0, 100);

                // Also add image field if missing (for homepage compatibility)
                const updates = {
                    slug: slug
                };

                if (!article.image && article.featuredImage) {
                    updates.image = article.featuredImage;
                }

                if (!article.description && article.excerpt) {
                    updates.description = article.excerpt;
                }

                await updateDoc(doc(db, 'articles', docSnap.id), updates);
                console.log(`Fixed: ${title} -> ${slug}`);
                fixed++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Fixed ${fixed} articles, skipped ${skipped} articles that already had slugs`,
            fixed,
            skipped
        });

    } catch (error) {
        console.error('Fix Slugs Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
