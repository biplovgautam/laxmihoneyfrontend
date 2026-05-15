import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary, getOptimizedImageUrl } from '../../config/cloudinary';
import {
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  buildSlug,
} from '../../services/blogService';
import { LottieLoader } from '../LoadingSpinner';
import Toast from '../Toast';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  category: 'General',
  tags: '',
  likesEnabled: true,
  commentsEnabled: true,
  isPublished: true,
  image: null,
};

const categories = [
  'General',
  'Honey Tips',
  'Health & Wellness',
  'Behind the Scenes',
  'Sustainability',
  'News',
];

const BlogManagement = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const fileInputRef = useRef(null);

  const showToast = (type, message) => setToast({ show: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listBlogs({ onlyPublished: false, max: 100 });
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs', err);
      showToast('error', 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'General',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      likesEnabled: blog.likesEnabled !== false,
      commentsEnabled: blog.commentsEnabled !== false,
      isPublished: blog.isPublished !== false,
      image: blog.image || null,
    });
    setImageFile(null);
    setImagePreview(blog.image?.url || '');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setShowModal(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview('');
    setFormData(emptyForm);
  };

  const handleField = (key, value) => setFormData((f) => ({ ...f, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('error', 'Image must be under 8 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((f) => ({ ...f, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }
    if (!formData.content.trim()) {
      showToast('error', 'Content is required');
      return;
    }

    setSaving(true);
    try {
      let imageData = formData.image || null;
      if (imageFile) {
        setUploading(true);
        try {
          const uploaded = await uploadToCloudinary(imageFile);
          imageData = { url: uploaded.url, publicId: uploaded.publicId };
        } finally {
          setUploading(false);
        }
      }

      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags,
        likesEnabled: formData.likesEnabled,
        commentsEnabled: formData.commentsEnabled,
        isPublished: formData.isPublished,
        image: imageData,
      };

      if (editing) {
        await updateBlog(editing.id, payload);
        showToast('success', 'Blog updated');
      } else {
        payload.slug = buildSlug(payload.title);
        await createBlog(payload, user);
        showToast('success', 'Blog published');
      }

      closeModal();
      await refresh();
    } catch (err) {
      console.error('Save blog error', err);
      showToast('error', err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    try {
      await deleteBlog(blog.id);
      showToast('success', 'Blog deleted');
      await refresh();
    } catch (err) {
      console.error('Delete blog error', err);
      showToast('error', 'Failed to delete blog');
    }
  };

  const togglePublish = async (blog) => {
    try {
      await updateBlog(blog.id, { isPublished: !blog.isPublished });
      showToast('success', blog.isPublished ? 'Unpublished' : 'Published');
      await refresh();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to toggle publish status');
    }
  };

  return (
    <div className="space-y-6">
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Blog Posts</h2>
          <p className="text-sm text-gray-500">Manage blog content, likes and comments.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          <PlusIcon className="w-5 h-5" />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex justify-center">
          <LottieLoader text="Loading blogs..." />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <PhotoIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No blog posts yet. Click "New Post" to create one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
            >
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative">
                {blog.image?.url ? (
                  <img
                    src={getOptimizedImageUrl(blog.image.url, { width: 600, height: 340 })}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {!blog.isPublished && (
                    <span className="text-[10px] uppercase tracking-wide bg-gray-800/80 text-white px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-wide bg-amber-500/90 text-white px-2 py-0.5 rounded">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-800 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{blog.likesCount || 0} likes</span>
                  <span>{blog.commentsCount || 0} comments</span>
                </div>

                <div className="mt-1 flex gap-2 text-[10px] text-gray-400">
                  {!blog.likesEnabled && <span>Likes off</span>}
                  {!blog.commentsEnabled && <span>Comments off</span>}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(blog)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md font-medium"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => togglePublish(blog)}
                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    {blog.isPublished ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(blog)}
                    className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-md"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editing ? 'Edit Blog' : 'New Blog Post'}
                </h3>
                <button onClick={closeModal} disabled={saving || uploading} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                      <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">Click to upload</span>
                      <span className="text-xs text-gray-400">PNG, JPG up to 8 MB</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleField('title', e.target.value)}
                    placeholder="The Sweet Journey of Pure Honey"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleField('excerpt', e.target.value)}
                    rows={2}
                    placeholder="Short summary shown on the listing page."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleField('content', e.target.value)}
                    rows={10}
                    placeholder="Write your blog post here. Plain text or markdown-style formatting."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-mono text-sm"
                    required
                  />
                </div>

                {/* Category + Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleField('category', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleField('tags', e.target.value)}
                      placeholder="honey, health, recipes"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <ToggleRow
                    label="Allow likes"
                    checked={formData.likesEnabled}
                    onChange={(v) => handleField('likesEnabled', v)}
                  />
                  <ToggleRow
                    label="Allow comments"
                    checked={formData.commentsEnabled}
                    onChange={(v) => handleField('commentsEnabled', v)}
                  />
                  <ToggleRow
                    label="Published"
                    checked={formData.isPublished}
                    onChange={(v) => handleField('isPublished', v)}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving || uploading}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <LottieLoader size="small" showText={false} className="w-4 h-4" />
                        Uploading image...
                      </>
                    ) : saving ? (
                      <>
                        <LottieLoader size="small" showText={false} className="w-4 h-4" />
                        Saving...
                      </>
                    ) : (
                      editing ? 'Update Post' : 'Publish Post'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ToggleRow = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-amber-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
    {label}
  </label>
);

export default BlogManagement;
