import React from 'react';
import { BookOpen, Clock, CheckCircle, Play, Calendar } from 'lucide-react';

const EnrolledCourses = ({ enrollments, onCourseSelect }) => {
  const [courses, setCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadCourses();
  }, [enrollments]);

  const loadCourses = async () => {
    try {
      const { web3University_backend } = await import('declarations/web3University_backend');
      const coursePromises = enrollments.map(enrollment =>
        web3University_backend.get_course(enrollment.course_id)
      );
      const courseResults = await Promise.all(coursePromises);
      const validCourses = courseResults.filter(result => result[0]).map(result => result[0]);
      setCourses(validCourses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-6 text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No enrolled courses</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Start learning by enrolling in your first course</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">My Enrolled Courses</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          if (!enrollment) return null;
          
          return (
            <div key={course.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h3>
                  {enrollment.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${enrollment.progress_percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(Number(enrollment.enrolled_at) / 1000000).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {enrollment.completed_lessons.length} of {course.lessons.length} completed
                    </span>
                  </div>
                  <button
                    onClick={() => onCourseSelect(course)}
                    className="btn btn-primary text-sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {enrollment.progress_percentage === 0 ? 'Start' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;