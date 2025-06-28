import React, { useRef, useState } from 'react';

const CLOUD_NAME = 'dqfmpzsrk'; // TODO: Replace with your Cloudinary cloud name
const UPLOAD_PRESET = 'kigalicribs_unsigned'; // TODO: Replace with your unsigned upload preset

interface CloudinaryImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function CloudinaryImageUpload({ value, onChange }: CloudinaryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        urls.push(data.secure_url);
      }
    }
    setUploading(false);
    onChange([...(value || []), ...urls]);
  };

  const handleRemove = (url: string) => {
    onChange(value.filter(u => u !== url));
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {uploading ? 'Uploading...' : 'Upload Images'}
      </button>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((url, idx) => (
          <div key={idx} className="relative group">
            <img src={url} alt="Property" className="w-24 h-24 object-cover rounded border" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs opacity-80 group-hover:opacity-100"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 