'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

const isPublished = (article) => !article.status || article.status === 'published';
const isRssImport = (article) => article.isRssImport === true || !!article.sourceUrl;

const formatDate = (value) => {
    if (!value) return '—';
    const date = value.toDate ? value.toDate() : new Date(value.seconds ? value.seconds * 1000 : value);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const cell = { padding: '0.85rem 1rem', borderBottom: '1px solid #dee2e6', verticalAlign: 'middle' };
// Button colours follow the theme used in app/admin/rss-feeds/page.js
const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.8rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'none',
};
const iconButtonStyle = (backgroundColor, color = 'white') => ({
    ...buttonStyle,
    padding: '0.4rem',
    backgroundColor,
    color,
});

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
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

    const handleToggleStatus = async (article) => {
        if (busyId) return;
        const published = isPublished(article);
        if (published && !confirm('Are you sure you want to unpublish this article?')) return;

        const nextStatus = published ? 'draft' : 'published';
        setBusyId(article.id);
        try {
            await updateDoc(doc(db, 'articles', article.id), {
                status: nextStatus,
                updatedAt: serverTimestamp()
            });
            setArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: nextStatus } : a));
        } catch (error) {
            console.error('Error changing article status:', error);
            alert('Could not update the article status: ' + error.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (article) => {
        if (busyId) return;
        const rss = isRssImport(article);
        const message = rss
            ? 'Delete this RSS article permanently? It will also be blocked so the RSS importer does not bring it back.'
            : 'Are you sure you want to delete this article? This cannot be undone.';
        if (!confirm(message)) return;

        setBusyId(article.id);
        try {
            await deleteDoc(doc(db, 'articles', article.id));
            setArticles(prev => prev.filter(a => a.id !== article.id));
            if (rss && article.sourceUrl) {
                try {
                    await blockRssUrl(article);
                } catch (blockError) {
                    console.error('Error blocking RSS url:', blockError);
                    alert('Article deleted, but it could not be blocked and may be re-imported by RSS: ' + blockError.message);
                }
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Could not delete the article: ' + error.message);
        } finally {
            setBusyId(null);
        }
    };

    const blockRssUrl = async (article) => {
        const existing = await getDocs(query(collection(db, 'blockedRssUrls'), where('url', '==', article.sourceUrl)));
        if (!existing.empty) return;
        await addDoc(collection(db, 'blockedRssUrls'), {
            url: article.sourceUrl,
            title: article.title || null,
            blockedAt: serverTimestamp()
        });
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
                <Link href="/admin/editor" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', marginRight: '1rem' }}>
                    + Create New Article
                </Link>
                <Link href="/admin/rss-feeds" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#6f42c1', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                    Manage RSS Feeds
                </Link>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '45%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '17%' }} />
                    </colgroup>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                            <th style={{ ...cell, background: '#f8f9fa' }}>Title</th>
                            <th style={{ ...cell, background: '#f8f9fa' }}>Status</th>
                            <th style={{ ...cell, background: '#f8f9fa' }}>Category</th>
                            <th style={{ ...cell, background: '#f8f9fa' }}>Date</th>
                            <th style={{ ...cell, background: '#f8f9fa' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map(article => {
                            const rss = isRssImport(article);
                            const published = isPublished(article);
                            const busy = busyId === article.id;
                            return (
                                <tr key={article.id}>
                                    <td style={{ ...cell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={article.title}>
                                        {article.title}
                                    </td>
                                    <td style={cell}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: published ? '#dcfce7' : '#fef3c7',
                                            color: published ? '#166534' : '#92400e'
                                        }}>
                                            {published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ ...cell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.category}</td>
                                    <td style={cell}>{formatDate(article.createdAt)}</td>
                                    <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', gap: '1.3rem', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleToggleStatus(article)}
                                                disabled={busy}
                                                title={published ? 'Unpublish this article' : 'Publish this article'}
                                                style={{ ...iconButtonStyle(published ? '#28a745' : '#6c757d'), opacity: busy ? 0.6 : 1, cursor: busy ? 'wait' : 'pointer' }}
                                            >
                                                {published ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            {
                                                <Link href={`/admin/editor?id=${article.id}`} title="Edit" style={iconButtonStyle('#ffc107', '#000')}>
                                                    <Edit2 size={16} />
                                                </Link>
                                            }
                                            <button
                                                onClick={() => handleDelete(article)}
                                                disabled={busy}
                                                title="Delete"
                                                style={{ ...iconButtonStyle('#dc3545'), opacity: busy ? 0.6 : 1, cursor: busy ? 'wait' : 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {articles.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>No articles found.</p>}
            </div>
        </div>
    );
}
