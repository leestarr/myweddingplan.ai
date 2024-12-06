import { useState } from 'react';
import { ChatBubbleLeftRightIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

// Temporary mock data for development
const initialPosts = [
  {
    id: 1,
    title: "Wedding Venue Recommendations in Sydney?",
    author: "Sarah",
    content: "Hi everyone! I'm looking for wedding venue recommendations in Sydney. Preferably something that can accommodate 150 guests with a garden setting. Any suggestions?",
    upvotes: 15,
    downvotes: 2,
    comments: [
      {
        id: 1,
        author: "Mike",
        content: "Check out the Royal Botanic Garden! They have multiple venues and the gardens are beautiful.",
        upvotes: 8,
        downvotes: 0,
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
    comments: [],
    timestamp: "2024-01-14T15:45:00Z"
  }
];

export default function WeddingForum() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showNewPostForm, setShowNewPostForm] = useState(false);

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

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newPostData = {
      id: posts.length + 1,
      ...newPost,
      author: "Current User", // This would come from auth context in production
      upvotes: 0,
      downvotes: 0,
      comments: [],
      timestamp: new Date().toISOString()
    };
    setPosts([newPostData, ...posts]);
    setNewPost({ title: '', content: '' });
    setShowNewPostForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Wedding Forum</h1>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create New Post
        </button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmitPost}>
            <div className="mb-4">
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
            <div className="mb-4">
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
            <div className="flex justify-end space-x-3">
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
        {posts.map(post => (
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Posted by {post.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.timestamp).toLocaleDateString()}</span>
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
                        <p className="text-gray-600 mb-2">{comment.content}</p>
                        <p className="text-sm text-gray-500">
                          Comment by {comment.author}
                        </p>
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
