'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { DEFAULT_FEEDS } from '@/lib/rss';
import { Trash2, Edit2, Play, Plus, Save, X } from 'lucide-react';

export default function RssFeedsAdmin() {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [importStatus, setImportStatus] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        category: 'technology',
        enabled: true
    });

    const CATEGORIES = ['news', 'technology', 'business', 'lifestyle', 'entertainment', 'sports', 'politics', 'health'];

    useEffect(() => {
        fetchFeeds();
    }, []);

    const fetchFeeds = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(query(collection(db, 'rssFeeds'), orderBy('category')));

            // If database is empty, seed with defaults
            if (querySnapshot.empty) {
                console.log('Database empty, seeding default feeds...');
                for (const feed of DEFAULT_FEEDS) {
                    await addDoc(collection(db, 'rssFeeds'), feed);
                }
                // Fetch again after seeding
                const newSnapshot = await getDocs(query(collection(db, 'rssFeeds'), orderBy('category')));
                const feedsData = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFeeds(feedsData);
            } else {
                const feedsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFeeds(feedsData);
            }
        } catch (error) {
            console.error("Error fetching feeds:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateDoc(doc(db, 'rssFeeds', editingId), formData);
            } else {
                await addDoc(collection(db, 'rssFeeds'), formData);
            }
            fetchFeeds();
            resetForm();
        } catch (error) {
            console.error("Error saving feed:", error);
        }
    };

    const handleEdit = (feed) => {
        setFormData({
            name: feed.name,
            url: feed.url,
            category: feed.category,
            enabled: feed.enabled
        });
        setEditingId(feed.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this feed?')) {
            try {
                await deleteDoc(doc(db, 'rssFeeds', id));
                fetchFeeds();
            } catch (error) {
                console.error("Error deleting feed:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', url: '', category: 'technology', enabled: true });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleManualImport = async (category) => {
        setImportStatus(`Starting import for ${category}...`);
        try {
            const response = await fetch('/api/rss/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category })
            });

            if (response.ok) {
                const result = await response.json();
                setImportStatus(`Success! Imported: ${result.stats.imported}, Duplicates: ${result.stats.duplicates}`);
            } else {
                setImportStatus(`Failed. Status: ${response.status}`);
            }

        } catch (error) {
            setImportStatus(`Error: ${error.message}`);
        }
    };

    // Styles
    const containerStyle = {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        color: '#333'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem'
    };

    const formStyle = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
    };

    const inputGroupStyle = {
        marginBottom: '1rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '0.5rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
    };

    const thStyle = {
        padding: '1rem',
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6'
    };

    const tdStyle = {
        padding: '1rem',
        borderBottom: '1px solid #dee2e6'
    };

    const badgeStyle = {
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>RSS Feed Manager</h1>
                <button
                    onClick={() => setIsAdding(true)}
                    style={buttonStyle}
                >
                    <Plus size={20} /> Add New Feed
                </button>
            </div>

            {importStatus && (
                <div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #dee2e6' }}>
                    <strong>Status:</strong> {importStatus}
                </div>
            )}

            {isAdding && (
                <div style={formStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editingId ? 'Edit Feed' : 'Add New Feed'}</h2>
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={inputGroupStyle}>
                                <label style={{ fontWeight: '500' }}>Feed Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={{ fontWeight: '500' }}>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={{ fontWeight: '500' }}>RSS URL</label>
                            <input
                                type="url"
                                name="url"
                                value={formData.url}
                                onChange={handleInputChange}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleInputChange}
                                style={{ marginRight: '0.5rem', width: '1.2rem', height: '1.2rem' }}
                            />
                            <label>Enabled</label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ ...buttonStyle, backgroundColor: '#6c757d' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ ...buttonStyle, backgroundColor: '#28a745' }}
                            >
                                <Save size={18} /> Save Feed
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>URL</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeds.map(feed => (
                            <tr key={feed.id} style={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                <td style={tdStyle}>{feed.name}</td>
                                <td style={tdStyle}>
                                    <span style={{ ...badgeStyle, backgroundColor: '#e2e6ea', color: '#333' }}>
                                        {feed.category}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, color: '#666', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {feed.url}
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ ...badgeStyle, backgroundColor: feed.enabled ? '#d4edda' : '#f8d7da', color: feed.enabled ? '#155724' : '#721c24' }}>
                                        {feed.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleManualImport(feed.category)}
                                            style={{ ...buttonStyle, padding: '0.4rem', backgroundColor: '#17a2b8' }}
                                            title="Run Import Now"
                                        >
                                            <Play size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(feed)}
                                            style={{ ...buttonStyle, padding: '0.4rem', backgroundColor: '#ffc107', color: '#000' }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(feed.id)}
                                            style={{ ...buttonStyle, padding: '0.4rem', backgroundColor: '#dc3545' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {feeds.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                                    No feeds configured. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
