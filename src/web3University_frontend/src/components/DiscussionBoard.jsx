import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Send, Reply, User, Clock } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const DiscussionBoard = ({ courseId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDiscussions();
  }, [courseId]);

  const loadDiscussions = async () => {
    try {
      const discussionsData = await web3University_backend.get_course_discussions(courseId);
      setDiscussions(discussionsData);
    } catch (error) {
      console.error('Failed to load discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await web3University_backend.create_discussion(
        courseId,
        newDiscussion.title,
        newDiscussion.content
      );
      
      if (result.Ok) {
        setNewDiscussion({ title: '', content: '' });
        setShowCreateForm(false);
        loadDiscussions();
      } else {
        console.error('Failed to create discussion:', result.Err);
      }
    } catch (error) {
      console.error('Failed to create discussion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (discussionId) => {
    setIsSubmitting(true);
    
    try {
      const result = await web3University_backend.reply_to_discussion(
        discussionId,
        replyContent
      );
      
      if (result.Ok) {
        setReplyContent('');
        setReplyingTo(null);
        loadDiscussions();
      } else {
        console.error('Failed to reply:', result.Err);
      }
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Course Discussions</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter discussion title"
                required
              />
            </div>
            <div>
              <label className="form-label">Content</label>
              <textarea
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                className="input-field"
                rows={4}
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Discussion'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {discussions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-500 mb-4">Start the conversation by creating the first discussion</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{discussion.author_name}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(discussion.created_at)}</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {discussion.title}
                  </h4>
                  <p className="text-gray-700 mb-4">{discussion.content}</p>
                  
                  <button
                    onClick={() => setReplyingTo(discussion.id)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>

              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="ml-11 space-y-4 border-l-2 border-gray-100 pl-4">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{reply.author_name}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(reply.created_at)}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === discussion.id && (
                <div className="ml-11 mt-4 border-l-2 border-gray-100 pl-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder="Write your reply..."
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleReply(discussion.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                          className="btn btn-primary text-sm disabled:opacity-50"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {isSubmitting ? 'Sending...' : 'Send Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          className="btn btn-outline text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionBoard;