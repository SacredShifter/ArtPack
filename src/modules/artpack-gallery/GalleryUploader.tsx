import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Sparkles, X } from 'lucide-react';
import { GalleryAPI } from './GalleryAPI';
import { GalleryValidator, computeChecksum } from './GalleryValidator';
import { SignatureUtils } from './SignatureUtils';
import type { UploadMetadata, ValidationResult } from './types';

interface GalleryUploaderProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function GalleryUploader({ onSuccess, onClose }: GalleryUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<UploadMetadata>({
    title: '',
    description: '',
    author_name: '',
    license: 'MIT',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setValidation(null);

    setValidating(true);
    try {
      const result = await GalleryValidator.validatePackArchive(selectedFile);
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(t => t !== tag)
    });
  };

  const handleUpload = async () => {
    if (!file || !validation?.valid) return;

    if (!metadata.title || !metadata.author_name) {
      setError('Title and Author Name are required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const userId = 'anonymous';
      const fileUrl = await GalleryAPI.uploadPackArchive(file, metadata, userId);

      const checksum = await computeChecksum(file);

      const manifestUrl = fileUrl.replace('.zip', '/manifest.json');

      const signature = await SignatureUtils.signManifest({
        title: metadata.title,
        checksum
      });

      await GalleryAPI.createPackRecord(
        {
          manifest_url: manifestUrl,
          title: metadata.title,
          description: metadata.description,
          author_name: metadata.author_name,
          version: '1.0.0',
          license: metadata.license,
          tags: metadata.tags,
          safety_passed: validation.valid,
          safety_report: validation.safetyReport,
          signature,
          status: 'published'
        },
        userId
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-300" />
            <h2 className="text-2xl font-bold text-white">Upload Art Pack</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-purple-200" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 transition-all duration-300
              ${isDragging
                ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                : 'border-purple-500/30 bg-purple-500/5 hover:border-purple-400/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className={`
                p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 transition-transform
                ${isDragging ? 'scale-110' : 'scale-100'}
              `}>
                <Upload className="w-12 h-12 text-purple-300" />
              </div>

              {file ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-purple-200">{file.name}</p>
                  <p className="text-sm text-purple-300 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-purple-200">
                    Drop your ZIP archive here
                  </p>
                  <p className="text-sm text-purple-300 mt-1">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-105"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {validating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                <div className="flex items-center gap-3 text-purple-200">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Validating...</span>
                </div>
              </div>
            )}
          </div>

          {validation && (
            <div className={`
              p-4 rounded-xl border
              ${validation.valid
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
              }
            `}>
              <div className="flex items-start gap-3">
                {validation.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className={`font-semibold ${validation.valid ? 'text-green-200' : 'text-red-200'}`}>
                    {validation.valid ? 'Pack validated successfully' : 'Validation issues found'}
                  </p>
                  {validation.warnings.length > 0 && (
                    <div className="space-y-1">
                      {validation.warnings.map((warning, i) => (
                        <p key={i} className="text-sm text-yellow-200">• {warning}</p>
                      ))}
                    </div>
                  )}
                  {validation.errors.length > 0 && (
                    <div className="space-y-1">
                      {validation.errors.map((error, i) => (
                        <p key={i} className="text-sm text-red-200">• {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Pack Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Aurora Dreams"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Author Name *
              </label>
              <input
                type="text"
                value={metadata.author_name}
                onChange={(e) => setMetadata({ ...metadata, author_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 resize-none"
                placeholder="Describe your visual experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                License
              </label>
              <select
                value={metadata.license}
                onChange={(e) => setMetadata({ ...metadata, license: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="MIT">MIT</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="Apache-2.0">Apache-2.0</option>
                <option value="CC-BY-4.0">CC-BY-4.0</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                  placeholder="geometric, minimal, dreamy..."
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Add
                </button>
              </div>
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-200 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-purple-200">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={!file || !validation?.valid || uploading || !metadata.title || !metadata.author_name}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:scale-100"
            >
              {uploading ? 'Uploading...' : 'Upload to Gallery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
