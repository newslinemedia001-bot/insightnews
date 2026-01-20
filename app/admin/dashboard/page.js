'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/admin');
            } else {
                setUser(currentUser);
                fetchArticles();
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchArticles = async () => {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(articlesData);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this article?')) {
            await deleteDoc(doc(db, 'articles', id));
            fetchArticles();
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/admin');
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div>
                    <span style={{ marginRight: '1rem' }}>{user?.email}</span>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/editor" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                    + Create New Article
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>Title</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>Category</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>Date</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #dee2e6' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(article => (
                            <tr key={article.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '1rem' }}>{article.title}</td>
                                <td style={{ padding: '1rem' }}>{article.category}</td>
                                <td style={{ padding: '1rem' }}>{new Date(article.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/admin/editor?id=${article.id}`} style={{ marginRight: '1rem', color: '#007bff' }}>Edit</Link>
                                    <button onClick={() => handleDelete(article.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {articles.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>No articles found.</p>}
            </div>
        </div>
    );
}
