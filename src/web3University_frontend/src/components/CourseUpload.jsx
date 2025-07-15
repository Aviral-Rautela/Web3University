import React, { useState } from 'react';
import { ArrowLeft, Plus, X, BookOpen } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const CourseUpload = ({ onBack, onCourseCreated }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    lessons: []
  });
  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    content: '',
    videoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setCurrentLesson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addLesson = () => {
    if (currentLesson.title && currentLesson.content) {
      setCourseData(prev => ({
        ...prev,
        lessons: [...prev.lessons, { ...currentLesson, order: prev.lessons.length + 1 }]
      }));
      setCurrentLesson({ title: '', content: '', videoUrl: '' });
    }
  };

  const removeLesson = (index) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create course
      const courseResult = await web3University_backend.create_course(
        courseData.title,
        courseData.description
      );

      if (courseResult.Ok) {
        const courseId = courseResult.Ok.id;
        
        // Add lessons to course
        for (const lesson of courseData.lessons) {
          await web3University_backend.add_lesson_to_course(
            courseId,
            lesson.title,
            lesson.content,
            lesson.videoUrl ? [lesson.videoUrl] : [],
            lesson.order
          );
        }

        onCourseCreated();
      } else {
        console.error('Failed to create course:', courseResult.Err);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'Course Details' },
    { id: 'lessons', label: 'Lessons' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleCourseChange}
                    className="input-field"
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Course Description</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseChange}
                    className="input-field"
                    rows={4}
                    placeholder="Describe what students will learn in this course"
                    required
                  />
                </div>

                <div className="bg-primary-50 rounded-lg p-4">
                  <h3 className="font-medium text-primary-900 mb-2">Course Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-primary-600">Title:</span>
                      <p className="text-primary-900">{courseData.title || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-primary-600">Lessons:</span>
                      <p className="text-primary-900">{courseData.lessons.length} lessons</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add Lessons</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Lesson Title</label>
                      <input
                        type="text"
                        name="title"
                        value={currentLesson.title}
                        onChange={handleLessonChange}
                        className="input-field"
                        placeholder="Enter lesson title"
                      />
                    </div>

                    <div>
                      <label className="form-label">Lesson Content</label>
                      <textarea
                        name="content"
                        value={currentLesson.content}
                        onChange={handleLessonChange}
                        className="input-field"
                        rows={4}
                        placeholder="Enter lesson content"
                      />
                    </div>

                    <div>
                      <label className="form-label">Video URL (Optional)</label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={currentLesson.videoUrl}
                        onChange={handleLessonChange}
                        className="input-field"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addLesson}
                      disabled={!currentLesson.title || !currentLesson.content}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </button>
                  </div>
                </div>

                {courseData.lessons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Course Lessons</h3>
                    <div className="space-y-3">
                      {courseData.lessons.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-5 w-5 text-gray-500" />
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{lesson.content}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLesson(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !courseData.title || !courseData.description || courseData.lessons.length === 0}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                {isSubmitting ? 'Creating Course...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseUpload;