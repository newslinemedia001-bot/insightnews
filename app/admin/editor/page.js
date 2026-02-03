'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import InvitusSeo from '@/app/components/admin/InvitusSeo';
import ImageUploader from '@/app/components/admin/ImageUploader';
import RichTextEditor from '@/app/components/admin/RichTextEditor';
import { ArrowLeft, User, Calendar, Tag, FileText } from 'lucide-react';

function ArticleEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        content: '',
        category: 'Politics',
        image: '',
        author: '',
        focusKeyword: '',
        isBreaking: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/admin');
            } else {
                if (articleId) {
                    fetchArticle(articleId);
                } else {
                    setLoading(false);
                    setFormData(prev => ({ ...prev, author: user.email?.split('@')[0] || 'Admin' }));
                }
            }
        });
        return () => unsubscribe();
    }, [articleId, router]);

    const fetchArticle = async (id) => {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setFormData({ ...docSnap.data() });
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { [name]: value };
            if (name === 'title' && !articleId) {
                updates.slug = value
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
            }
            return { ...prev, ...updates };
        });
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const dataToSave = { ...formData, updatedAt: serverTimestamp() };
            if (articleId) {
                await updateDoc(doc(db, 'articles', articleId), dataToSave);
                alert("Article updated successfully!");
            } else {
                dataToSave.createdAt = serverTimestamp();
                dataToSave.views = 0;
                await addDoc(collection(db, 'articles'), dataToSave);
                alert("Article published successfully!");
            }
            router.push('/admin/dashboard');
        } catch (error) {
            console.error("Error saving article:", error);
            alert("Error saving article");
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Editor...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb', fontFamily: 'Inter, sans-serif' }}>

            {/* Main Content Area */}
            <div style={{ flex: '1', padding: '2rem', maxWidth: '1000px', margin: '0 0' }}>
                <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', fontWeight: '500' }}>
                    <ArrowLeft size={18} style={{ marginRight: '5px' }} /> Back to Dashboard
                </button>

                <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#111827', fontWeight: '800' }}>
                    {articleId ? 'Edit Article' : 'Create New Article'}
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Title Area */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Article Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter a catchy headline..."
                            style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                            required
                        />
                    </div>

                    {/* Main Content Editor */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} /> Content
                        </label>
                        <RichTextEditor value={formData.content} onChange={handleContentChange} />
                    </div>

                    {/* Excerpt */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>Short Description (Excerpt)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief summary for search engines and cards..."
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                        />
                    </div>

                    {/* Mobile-style Layout for bottom elements */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Category */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                                <Tag size={18} /> Category
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', appearance: 'none', background: 'white', fontSize: '1rem' }}
                                >
                                    <option value="Politics">Politics</option>
                                    <option value="Business">Business</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="People">People</option>
                                    <option value="Family">Family</option>
                                    <option value="Crime">Crime</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Opinion">Opinion</option>
                                    <option value="World">World</option>
                                    <option value="Kenya">Kenya</option>
                                </select>
                            </div>
                        </div>

                        {/* Author */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                                <User size={18} /> Author
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Featured Image</label>
                        <ImageUploader currentImage={formData.image} onImageUpload={handleImageUpload} />
                    </div>

                    {/* Submit Action */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                id="isBreaking"
                                checked={formData.isBreaking || false}
                                onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="isBreaking" style={{ fontWeight: '500', color: '#374151', cursor: 'pointer' }}>Set as Main Breaking News</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '0.875rem 2.5rem',
                                background: isSubmitting ? '#93c5fd' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {isSubmitting ? (articleId ? 'Updating...' : 'Publishing...') : (articleId ? 'Update' : 'Publish')}
                        </button>
                    </div>

                </form>
            </div>

            {/* Right SEO Sidebar */}
            <div style={{ width: '380px', padding: '2rem', background: 'white', borderLeft: '1px solid #e5e7eb', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
                <h3 style={{ textTransform: 'uppercase', color: '#9ca3af', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Publishing Tools</h3>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#374151', fontSize: '0.9rem' }}>URL Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', color: '#6b7280', background: '#f9fafb' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#374151', fontSize: '0.9rem' }}>Focus Keyword</label>
                    <input
                        type="text"
                        name="focusKeyword"
                        value={formData.focusKeyword}
                        onChange={handleChange}
                        placeholder="Target keyword for SEO..."
                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                </div>

                <InvitusSeo
                    title={formData.title}
                    description={formData.description}
                    content={formData.content}
                    slug={formData.slug}
                    focusKeyword={formData.focusKeyword}
                />
            </div>

        </div>
    );
}

export default function ArticleEditor() {
    return (
        <Suspense fallback={<div>Loading Editor...</div>}>
            <ArticleEditorContent />
        </Suspense>
    );
}
