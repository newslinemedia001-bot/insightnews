import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
    
    // Fetch all articles
    const articlesQuery = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const articlesSnapshot = await getDocs(articlesQuery);
    
    const articleUrls = articlesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            url: `${baseUrl}/${data.slug}`,
            lastModified: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(data.createdAt.seconds * 1000),
            changeFrequency: 'daily',
            priority: 0.8,
        };
    });
    
    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/politics`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/business`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/entertainment`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
    ];
    
    return [...staticPages, ...articleUrls];
}
