import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const POSTS_COLLECTION = 'forum_posts';
const COMMENTS_COLLECTION = 'forum_comments';
const USERS_COLLECTION = 'users';

export const forumService = {
  // Posts
  createPost: async (postData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to create a post');

      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      const userData = userDoc.data();

      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        authorId: user.uid,
        authorName: userData?.displayName || 'Anonymous',
        authorAvatar: userData?.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        votes: 0,
        commentCount: 0,
        bookmarks: [],
        reports: []
      });

      return {
        id: docRef.id,
        ...postData,
        authorId: user.uid,
        authorName: userData?.displayName || 'Anonymous',
        authorAvatar: userData?.photoURL || null
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  getPosts: async (category = 'All', sortBy = 'newest') => {
    try {
      let q = collection(db, POSTS_COLLECTION);
      
      // Build the query based on category and sort
      if (category !== 'All') {
        if (sortBy === 'newest') {
          q = query(q, 
            where('category', '==', category),
            orderBy('createdAt', 'desc')
          );
        } else if (sortBy === 'popular') {
          q = query(q,
            where('category', '==', category),
            orderBy('votes', 'desc')
          );
        } else if (sortBy === 'controversial') {
          q = query(q,
            where('category', '==', category),
            orderBy('commentCount', 'desc')
          );
        }
      } else {
        // If no category filter, just sort
        if (sortBy === 'newest') {
          q = query(q, orderBy('createdAt', 'desc'));
        } else if (sortBy === 'popular') {
          q = query(q, orderBy('votes', 'desc'));
        } else if (sortBy === 'controversial') {
          q = query(q, orderBy('commentCount', 'desc'));
        }
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to update a post');

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) throw new Error('Post not found');
      if (postDoc.data().authorId !== user.uid) throw new Error('Unauthorized to update this post');

      await updateDoc(postRef, {
        ...postData,
        updatedAt: serverTimestamp()
      });

      return {
        id: postId,
        ...postData
      };
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to delete a post');

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) throw new Error('Post not found');
      if (postDoc.data().authorId !== user.uid) throw new Error('Unauthorized to delete this post');

      await deleteDoc(postRef);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Comments
  addComment: async (postId, commentData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to comment');

      const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
      const userData = userDoc.data();

      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
        ...commentData,
        postId,
        authorId: user.uid,
        authorName: userData?.displayName || 'Anonymous',
        authorAvatar: userData?.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        votes: 0
      });

      // Increment comment count on post
      await updateDoc(doc(db, POSTS_COLLECTION, postId), {
        commentCount: increment(1)
      });

      return {
        id: docRef.id,
        ...commentData,
        authorId: user.uid,
        authorName: userData?.displayName || 'Anonymous',
        authorAvatar: userData?.photoURL || null
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  getComments: async (postId) => {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  // Votes
  votePost: async (postId, voteType) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to vote');

      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        votes: increment(voteType === 'up' ? 1 : -1)
      });

      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  },

  voteComment: async (commentId, voteType) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to vote');

      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      await updateDoc(commentRef, {
        votes: increment(voteType === 'up' ? 1 : -1)
      });

      return true;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw error;
    }
  },

  // Bookmarks
  toggleBookmark: async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to bookmark');

      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) throw new Error('Post not found');

      const bookmarks = postDoc.data().bookmarks || [];
      const isBookmarked = bookmarks.includes(user.uid);

      await updateDoc(postRef, {
        bookmarks: isBookmarked 
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)
      });

      return !isBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  // Reports
  reportPost: async (postId, reason) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User must be authenticated to report');

      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        reports: arrayUnion({
          userId: user.uid,
          reason,
          timestamp: serverTimestamp()
        })
      });

      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    }
  }
};

export default forumService;
