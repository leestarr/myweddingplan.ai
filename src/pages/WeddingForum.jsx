import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import parse from 'html-react-parser';
import { useLocation } from 'react-router-dom';
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
  LinkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

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

// Temporary mock data for development
const initialPosts = [
  {
    id: 1,
    title: "Wedding Venue Recommendations in Sydney?",
    author: "Sarah",
    content: "Hi everyone! I'm looking for wedding venue recommendations in Sydney. Preferably something that can accommodate 150 guests with a garden setting. Any suggestions?",
    upvotes: 15,
    downvotes: 2,
    category: "Venue Ideas",
    tags: ["Sydney", "Garden Venue", "Large Wedding"],
    bookmarked: false,
    comments: [
      {
        id: 1,
        author: "Mike",
        content: "Check out the Royal Botanic Garden! They have multiple venues and the gardens are beautiful.",
        upvotes: 8,
        downvotes: 0,
        timestamp: "2024-01-15T10:35:00Z"
      }
    ],
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "DIY Wedding Favors Ideas",
    author: "Emma",
    content: "Looking for creative DIY wedding favor ideas that won't break the bank. What did you do for your wedding?",
    upvotes: 12,
    downvotes: 1,
    category: "DIY & Crafts",
    tags: ["DIY", "Budget-friendly", "Wedding Favors"],
    bookmarked: false,
    comments: [],
    timestamp: "2024-01-14T15:45:00Z"
  }
];

export default function WeddingForum() {
  const location = useLocation();
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: 'General Discussion', 
    tags: [],
    embedLinks: []
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedLink, setEmbedLink] = useState("");
  const [editorLoaded, setEditorLoaded] = useState(false);
  
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize category from URL parameters
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    // Update URL without navigation
    const newUrl = new URL(window.location);
    if (category === "All") {
      newUrl.searchParams.delete('category');
    } else {
      newUrl.searchParams.set('category', category);
    }
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleEditorChange = useCallback((content) => {
    setNewPost(prev => ({ ...prev, content }));
  }, []);

  const handleCommentEditorChange = useCallback((content) => {
    setNewComment(content);
  }, []);

  const handleAddEmbed = () => {
    if (embedLink.trim()) {
      setNewPost(prev => ({
        ...prev,
        embedLinks: [...prev.embedLinks, embedLink.trim()]
      }));
      setEmbedLink("");
      setShowEmbedInput(false);
    }
  };

  const handleRemoveEmbed = (linkToRemove) => {
    setNewPost(prev => ({
      ...prev,
      embedLinks: prev.embedLinks.filter(link => link !== linkToRemove)
    }));
  };

  const handleVote = (postId, type, isComment = false, commentId = null) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (!isComment) {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: type === 'up' ? post.upvotes + 1 : post.upvotes,
              downvotes: type === 'down' ? post.downvotes + 1 : post.downvotes
            };
          }
        } else {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    upvotes: type === 'up' ? comment.upvotes + 1 : comment.upvotes,
                    downvotes: type === 'down' ? comment.downvotes + 1 : comment.downvotes
                  };
                }
                return comment;
              })
            };
          }
        }
        return post;
      })
    );
  };

  const handleBookmark = (postId) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
      )
    );
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newPostData = {
      id: posts.length + 1,
      ...newPost,
      author: "Current User", // This would come from auth context in production
      upvotes: 0,
      downvotes: 0,
      comments: [],
      bookmarked: false,
      timestamp: new Date().toISOString(),
      content: editorRef.current ? editorRef.current.getContent() : newPost.content
    };
    setPosts([newPostData, ...posts]);
    setNewPost({ 
      title: '', 
      content: '', 
      category: 'General Discussion', 
      tags: [],
      embedLinks: []
    });
    setShowNewPostForm(false);
  };

  const handleSubmitComment = (postId) => {
    if (!newComment.trim()) return;

    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          const newCommentObj = {
            id: post.comments.length + 1,
            author: "Current User",
            content: newComment,
            upvotes: 0,
            downvotes: 0,
            timestamp: new Date().toISOString()
          };
          return {
            ...post,
            comments: [...post.comments, newCommentObj]
          };
        }
        return post;
      })
    );
    setNewComment("");
    setReplyingTo(null);
  };

  const filteredAndSortedPosts = posts
    .filter(post => 
      (selectedCategory === "All" || post.category === selectedCategory) &&
      (searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case "controversial":
          return (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes);
        case "newest":
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Wedding Forum</h1>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Post
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex space-x-4 bg-white rounded-lg shadow p-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="controversial">Controversial</option>
        </select>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <form onSubmit={handleSubmitPost}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              {!editorLoaded ? (
                <div className="animate-pulse bg-gray-200 h-64 rounded-md"></div>
              ) : (
                <Editor
                  apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                  onInit={(evt, editor) => {
                    editorRef.current = editor;
                    setEditorLoaded(true);
                  }}
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
                      'removeformat | image link | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    images_upload_handler: async (blobInfo, progress) => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(blobInfo.blob());
                      });
                    }
                  }}
                  value={newPost.content}
                  onEditorChange={handleEditorChange}
                />
              )}
            </div>

            {/* Embed Links Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Embedded Links
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmbedInput(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Add Link
                </button>
              </div>
              
              {showEmbedInput && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="Enter Pinterest or Instagram URL"
                    value={embedLink}
                    onChange={(e) => setEmbedLink(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmbed}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              )}

              {newPost.embedLinks.length > 0 && (
                <div className="space-y-2">
                  {newPost.embedLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-900 truncate">
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmbed(link)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <span className="sr-only">Remove</span>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newPost.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Tag
                </button>
              </form>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setShowNewPostForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {filteredAndSortedPosts.map(post => (
          <div key={post.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    className="text-gray-500 hover:text-primary-600"
                  >
                    <ArrowUpIcon className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium">
                    {post.upvotes - post.downvotes}
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
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <div className="mt-4">
                    {parse(post.content)}
                  </div>
                  
                  {/* Embedded Links Display */}
                  {post.embedLinks && post.embedLinks.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Related Links:</h4>
                      {post.embedLinks.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Posted by {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`text-gray-500 hover:text-primary-600 ${post.bookmarked ? 'text-primary-600' : ''}`}
                      >
                        {post.bookmarked ? (
                          <BookmarkSolidIcon className="h-5 w-5" />
                        ) : (
                          <BookmarkIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button className="text-gray-500 hover:text-primary-600">
                        <ShareIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-500 hover:text-primary-600">
                        <FlagIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>{post.comments.length} Comments</span>
              </div>

              {/* Add Comment Form */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={() => handleSubmitComment(post.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex space-x-4">
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => handleVote(post.id, 'up', true, comment.id)}
                        className="text-gray-500 hover:text-primary-600"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-medium">
                        {comment.upvotes - comment.downvotes}
                      </span>
                      <button
                        onClick={() => handleVote(post.id, 'down', true, comment.id)}
                        className="text-gray-500 hover:text-primary-600"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-500 hover:text-primary-600">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                            <button className="text-gray-500 hover:text-primary-600">
                              <FlagIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
