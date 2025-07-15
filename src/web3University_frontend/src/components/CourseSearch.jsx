import React, { useState, useEffect } from 'react';
import { Search, BookOpen, User, Calendar, Star, ChevronRight } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const CourseSearch = ({ onCourseSelect, enrollments, onEnrollmentUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, courses]);

  const loadCourses = async () => {
    try {
      const coursesData = await web3University_backend.get_all_courses();
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    if (!searchQuery) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId) => {
    setEnrollingCourses(prev => new Set(prev).add(courseId));
    
    try {
      await web3University_backend.enroll_in_course(courseId);
      onEnrollmentUpdate();
      
      // Find the course and navigate to it
      const course = courses.find(c => c.id === courseId);
      if (course) {
        onCourseSelect(course);
      }
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try a different search term' : 'No courses available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <User className="h-4 w-4" />
                  <span>{course.instructor_name}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(Number(course.created_at) / 1000000).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isEnrolled(course.id) ? (
                    <button
                      onClick={() => onCourseSelect(course)}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingCourses.has(course.id)}
                      className="btn btn-primary flex-1 text-sm disabled:opacity-50"
                    >
                      {enrollingCourses.has(course.id) ? (
                        <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Enroll Now'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSearch;