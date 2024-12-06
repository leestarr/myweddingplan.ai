import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShareIcon,
  FlagIcon,
  TagIcon,
  FireIcon
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
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General Discussion', tags: [] });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, popular, controversial
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newTag, setNewTag] = useState("");

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
      timestamp: new Date().toISOString()
    };
    setPosts([newPostData, ...posts]);
    setNewPost({ title: '', content: '', category: 'General Discussion', tags: [] });
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Wedding Forum</h1>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Post
          </button>
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
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmitPost}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
          <div key={post.id} className="bg-white rounded-lg shadow">
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
                  <p className="text-gray-600 mb-4">{post.content}</p>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
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
