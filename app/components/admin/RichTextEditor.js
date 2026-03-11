import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });


export default function RichTextEditor({ value, onChange }) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ],
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
