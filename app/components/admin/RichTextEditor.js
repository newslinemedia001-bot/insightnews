import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Custom image handler for Cloudinary upload
const imageHandler = function() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        // Show loading state
        const range = this.quill.getSelection();
        this.quill.insertText(range.index, 'Uploading image...', 'user');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'insight_news');
            formData.append('cloud_name', 'dlvgrs5vp');

            const response = await fetch('https://api.cloudinary.com/v1_1/dlvgrs5vp/image/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (data.secure_url) {
                // Remove loading text and insert image
                this.quill.deleteText(range.index, 'Uploading image...'.length);
                this.quill.insertEmbed(range.index, 'image', data.secure_url, 'user');
                this.quill.setSelection(range.index + 1);
            } else {
                // Remove loading text and show error
                this.quill.deleteText(range.index, 'Uploading image...'.length);
                this.quill.insertText(range.index, 'Image upload failed', 'user');
                console.error('Upload failed', data);
            }
        } catch (error) {
            // Remove loading text and show error
            this.quill.deleteText(range.index, 'Uploading image...'.length);
            this.quill.insertText(range.index, 'Image upload failed', 'user');
            console.error('Error uploading image:', error);
        }
    };
};

export default function RichTextEditor({ value, onChange }) {
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['blockquote', 'code-block'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
            matchers: [
                // Preserve paragraph breaks and spacing
                ['BR', function(node, delta) {
                    return delta.insert('\n');
                }],
                ['P', function(node, delta) {
                    // Preserve paragraph spacing by adding newline after each paragraph
                    return delta.insert('\n');
                }],
                ['DIV', function(node, delta) {
                    return delta.insert('\n');
                }]
            ]
        }
    };

    return (
        <div className="rich-text-editor-container" style={{ background: 'white' }}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                style={{ height: '500px', marginBottom: '50px' }}
            />
        </div>
    );
}
