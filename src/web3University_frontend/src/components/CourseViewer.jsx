import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Play, MessageCircle, Award, FileText } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';
import QuizAttempt from './QuizAttempt';
import DiscussionBoard from './DiscussionBoard';

const CourseViewer = ({ course, onBack, enrollment }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [localEnrollment, setLocalEnrollment] = useState(enrollment);

  useEffect(() => {
    if (course.lessons.length > 0 && !selectedLesson) {
      const nextLesson = course.lessons.find(lesson => 
        !localEnrollment.completed_lessons.includes(lesson.id)
      ) || course.lessons[0];
      setSelectedLesson(nextLesson);
    }
  }, [course, localEnrollment, selectedLesson]);

  const markLessonCompleted = async (lessonId) => {
    try {
      await web3University_backend.mark_lesson_completed(course.id, lessonId);
      
      // Update local state
      const newCompletedLessons = [...localEnrollment.completed_lessons, lessonId];
      const newProgress = Math.round((newCompletedLessons.length / course.lessons.length) * 100);
      
      setLocalEnrollment(prev => ({
        ...prev,
        completed_lessons: newCompletedLessons,
        progress_percentage: newProgress,
        completed: newProgress === 100
      }));
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error);
    }
  };

  const handleTakeQuiz = async (quizId) => {
    try {
      const quizData = await web3University_backend.get_quiz(quizId);
      if (quizData[0]) {
        setCurrentQuiz(quizData[0]);
        setShowQuiz(true);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const handleQuizCompleted = () => {
    setShowQuiz(false);
    setCurrentQuiz(null);
  };

  const isLessonCompleted = (lessonId) => {
    return localEnrollment.completed_lessons.includes(lessonId);
  };

  const tabs = [
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'discussions', label: 'Discussions', icon: MessageCircle },
  ];

  if (showQuiz && currentQuiz) {
    return (
      <QuizAttempt
        quiz={currentQuiz}
        onComplete={handleQuizCompleted}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{course.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {localEnrollment.progress_percentage}%
                </p>
              </div>
              <div className="w-32">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${localEnrollment.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Course Content</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedLesson?.id === lesson.id ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isLessonCompleted(lesson.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Play className="h-3 w-3 text-gray-400" />
                          {lesson.quiz_id && (
                            <FileText className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'lessons' && selectedLesson && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedLesson.title}
                      </h2>
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                          <div dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, '<br/>') }} />
                        </div>
                      </div>
                    </div>

                    {selectedLesson.video_url && (
                      <div className="mb-6">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">Video Player (URL: {selectedLesson.video_url})</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      {!isLessonCompleted(selectedLesson.id) && (
                        <button
                          onClick={() => markLessonCompleted(selectedLesson.id)}
                          className="btn btn-primary"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </button>
                      )}
                      
                      {selectedLesson.quiz_id && (
                        <button
                          onClick={() => handleTakeQuiz(selectedLesson.quiz_id)}
                          className="btn btn-secondary"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'discussions' && (
                  <DiscussionBoard courseId={course.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;