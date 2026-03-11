'use client';
import { useState } from 'react';

export default function ImageUploader({ onImageUpload, currentImage }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'insight_news'); // Helper provided by user
        formData.append('cloud_name', 'dlvgrs5vp');

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dlvgrs5vp/image/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setPreview(data.secure_url);
                onImageUpload(data.secure_url);
            } else {
                console.error('Upload failed', data);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ border: '2px dashed #ddd', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: '#f9f9f9', position: 'relative' }}>
            {preview ? (
                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <img src={preview} alt="Featured" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', display: 'block', margin: '0 auto' }} />
                    <button
                        onClick={(e) => { e.preventDefault(); setPreview(''); onImageUpload(''); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div style={{ color: '#666' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" color="#888">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <p style={{ margin: 0 }}>Click to upload featured image</p>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>or drag and drop</p>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                    opacity: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                }}
            />

            {uploading && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Uploading...</span>
                </div>
            )}
        </div>
    );
}
