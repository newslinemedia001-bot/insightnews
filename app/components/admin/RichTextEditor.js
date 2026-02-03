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
            matchVisual: true,
            matchers: [
                // Allow pasting from Word with formatting
                ['B', function(node, delta) { return delta; }],
                ['I', function(node, delta) { return delta; }],
                ['U', function(node, delta) { return delta; }],
                ['STRONG', function(node, delta) { return delta; }],
                ['EM', function(node, delta) { return delta; }],
                ['P', function(node, delta) { return delta; }],
                ['H1', function(node, delta) { return delta; }],
                ['H2', function(node, delta) { return delta; }],
                ['H3', function(node, delta) { return delta; }],
                ['H4', function(node, delta) { return delta; }],
                ['H5', function(node, delta) { return delta; }],
                ['H6', function(node, delta) { return delta; }],
                ['UL', function(node, delta) { return delta; }],
                ['OL', function(node, delta) { return delta; }],
                ['LI', function(node, delta) { return delta; }],
                ['A', function(node, delta) { return delta; }],
                ['BLOCKQUOTE', function(node, delta) { return delta; }]
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
