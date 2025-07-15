import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, BarChart3, LogOut, Edit, Eye } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';
import ThemeToggle from './ThemeToggle';
import CourseUpload from './CourseUpload';
import QuizBuilder from './QuizBuilder';
import Loader from './Loader';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseUpload, setShowCourseUpload] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const coursesData = await web3University_backend.get_all_courses();
      const teacherCourses = coursesData.filter(course => course.instructor_id === user.id);
      setCourses(teacherCourses);
      setAllCourses(coursesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setShowCourseUpload(false);
    loadDashboardData();
  };

  const handleQuizCreated = () => {
    setShowQuizBuilder(false);
    loadDashboardData();
  };

  const tabs = [
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (showCourseUpload) {
    return (
      <CourseUpload
        onBack={() => setShowCourseUpload(false)}
        onCourseCreated={handleCourseCreated}
      />
    );
  }

  if (showQuizBuilder) {
    return (
      <QuizBuilder
        course={selectedCourse}
        onBack={() => setShowQuizBuilder(false)}
        onQuizCreated={handleQuizCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Web3 University</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCourseUpload(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Course</span>
              </button>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-3">
                <img
                  src={user.profile_photo}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Teacher</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.reduce((total, course) => total + (course.enrolled_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.reduce((total, course) => total + course.lessons.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
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
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
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
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {activeTab === 'courses' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
                <button
                  onClick={() => setShowCourseUpload(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Course</span>
                </button>
              </div>
              
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first course to get started</p>
                  <button
                    onClick={() => setShowCourseUpload(true)}
                    className="btn btn-primary"
                  >
                    Create Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="card hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span>{course.lessons.length} lessons</span>
                          <span>{new Date(Number(course.created_at) / 1000000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowQuizBuilder(true);
                            }}
                            className="btn btn-outline flex-1 text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Add Quiz
                          </button>
                          <button className="btn btn-primary flex-1 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Course Analytics</h2>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Detailed analytics and student progress tracking will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;