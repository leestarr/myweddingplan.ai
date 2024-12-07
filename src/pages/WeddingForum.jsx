import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import parse from 'html-react-parser';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShareIcon,
  FlagIcon,
  TagIcon,
  FireIcon,
  PhotoIcon,
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { forumService } from '../services/forumService';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';

const categories = [
  "All",
  "Planning Tips",
  "Vendor Reviews",
  "DIY & Crafts",
  "Budget Tips",
  "Dress & Attire",
  "Venue Ideas",
  "Honeymoon",
  "Etiquette",
  "Traditions",
  "General Discussion"
];

export default function WeddingForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPosts = await forumService.getPosts(selectedCategory, sortBy);
      setPosts(loadedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again later.');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('Please sign in to create a post');
      return;
    }

    try {
      const postData = {
        title: newPostTitle,
        content: newPostContent,
        category: selectedCategory === 'All' ? 'General Discussion' : selectedCategory,
        tags: [] // Initialize empty tags array
      };

      await forumService.createPost(postData);
      toast.success('Post created successfully');
      setShowNewPostForm(false);
      setNewPostTitle('');
      setNewPostContent('');
      loadPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Failed to create post');
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await forumService.votePost(postId, voteType);
      loadPosts();
    } catch (err) {
      console.error('Error voting:', err);
      toast.error('Failed to vote');
    }
  };

  const handleBookmark = async (postId) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to bookmark');
      return;
    }

    try {
      const isNowBookmarked = await forumService.toggleBookmark(postId);
      toast.success(isNowBookmarked ? 'Post bookmarked' : 'Bookmark removed');
      loadPosts();
    } catch (err) {
      console.error('Error bookmarking:', err);
      toast.error('Failed to bookmark post');
    }
  };

  const handleReport = async (postId) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to report');
      return;
    }

    const reason = prompt('Please provide a reason for reporting this post:');
    if (!reason) return;

    try {
      await forumService.reportPost(postId, reason);
      toast.success('Post reported successfully');
    } catch (err) {
      console.error('Error reporting:', err);
      toast.error('Failed to report post');
    }
  };

  const filteredAndSortedPosts = posts
    .filter(post => {
      if (selectedCategory !== 'All' && post.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      return true;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">{error}</div>
        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wedding Forum</h1>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="controversial">Most Discussed</option>
          </select>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredAndSortedPosts.map(post => (
          <div key={post.id} className="bg-white shadow sm:rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => handleVote(post.id, 'up')}
                  className="text-gray-500 hover:text-primary-600"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {post.votes || 0}
                </span>
                <button
                  onClick={() => handleVote(post.id, 'down')}
                  className="text-gray-500 hover:text-primary-600"
                >
                  <ArrowDownIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {post.category}
                  </span>
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                <div className="prose prose-sm max-w-none mt-4">
                  {parse(post.content)}
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className="text-gray-500 hover:text-primary-600"
                  >
                    {post.bookmarks?.includes(auth.currentUser?.uid) ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-primary-600" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button className="text-gray-500 hover:text-primary-600">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span className="ml-1 text-sm">{post.commentCount || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReport(post.id)}
                    className="text-gray-500 hover:text-primary-600"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Post</h2>
              <button
                onClick={() => setShowNewPostForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <Editor
                    apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                    onInit={(evt, editor) => editorRef.current = editor}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                    value={newPostContent}
                    onEditorChange={(content) => setNewPostContent(content)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
