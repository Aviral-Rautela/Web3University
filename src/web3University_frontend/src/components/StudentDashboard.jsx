import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Trophy, MessageCircle, User, LogOut, Play, Award } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';
import ThemeToggle from './ThemeToggle';
import CourseSearch from './CourseSearch';
import EnrolledCourses from './EnrolledCourses';
import CourseViewer from './CourseViewer';
import CertificateDownload from './CertificateDownload';
import Loader from './Loader';

const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [enrollmentData, certificateData] = await Promise.all([
        web3University_backend.get_student_enrollments(),
        web3University_backend.get_student_certificates()
      ]);
      
      setEnrollments(enrollmentData);
      setCertificates(certificateData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setActiveTab('viewer');
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setActiveTab('courses');
    loadDashboardData();
  };

  const tabs = [
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'search', label: 'Find Courses', icon: Search },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <CourseViewer
        course={selectedCourse}
        onBack={handleBackToDashboard}
        enrollment={enrollments.find(e => e.course_id === selectedCourse.id)}
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
              <ThemeToggle />
              <div className="flex items-center space-x-3">
                <img
                  src={user.profile_photo}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{enrollments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Trophy className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrollments.filter(e => e.completed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg">
                <Award className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{certificates.length}</p>
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
            <EnrolledCourses
              enrollments={enrollments}
              onCourseSelect={handleCourseSelect}
            />
          )}
          {activeTab === 'search' && (
            <CourseSearch
              onCourseSelect={handleCourseSelect}
              enrollments={enrollments}
              onEnrollmentUpdate={loadDashboardData}
            />
          )}
          {activeTab === 'certificates' && (
            <CertificateDownload certificates={certificates} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;