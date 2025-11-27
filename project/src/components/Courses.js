import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available');

  useEffect(() => {
    if (!user) return;
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // Get all courses
      const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('code', { ascending: true });

      if (coursesError) throw coursesError;

      // Get enrolled courses for current user
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;

      const enrolledIds = new Set(enrollments?.map(e => e.course_id) || []);
      
      setCourses(allCourses || []);
      setEnrolledCourses(enrollments ? allCourses.filter(c => enrolledIds.has(c.id)) : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({ student_id: user.id, course_id: courseId });

      if (error) throw error;
      console.log('Successfully enrolled in course');
      loadCourses();
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      console.log('Successfully unenrolled from course');
      loadCourses();
    } catch (err) {
      console.error('Unenrollment failed:', err);
    }
  };

  const displayedCourses = filter === 'enrolled' ? enrolledCourses : 
                          filter === 'available' ? courses.filter(c => !enrolledCourses.find(ec => ec.id === c.id)) : 
                          courses;

  if (loading) {
    return <div className="courses-container"><p>Loading courses...</p></div>;
  }

  return (
    <div className="courses-container">
      <h2 className="heading">📚 Courses</h2>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab-btn ${filter === 'enrolled' ? 'active' : ''}`}
          onClick={() => setFilter('enrolled')}
        >
          Enrolled ({enrolledCourses.length})
        </button>
        <button
          className={`tab-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available ({courses.length - enrolledCourses.length})
        </button>
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({courses.length})
        </button>
      </div>

      {/* Courses List */}
      <div className="courses-list">
        {displayedCourses.length === 0 ? (
          <p className="empty-message">
            {filter === 'enrolled' ? 'No enrolled courses yet.' : 'No available courses.'}
          </p>
        ) : (
          displayedCourses.map(course => {
            const isEnrolled = enrolledCourses.some(ec => ec.id === course.id);
            return (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div>
                    <h3 className="course-code">{course.code}</h3>
                    <h4 className="course-name">{course.name}</h4>
                  </div>
                  <span className="course-credits">{course.credits} credits</span>
                </div>

                {course.instructor && (
                  <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                )}

                {course.subject && (
                  <p className="course-subject">📖 {course.subject}</p>
                )}

                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}

                <div className="course-meta">
                  {course.dept && <span className="course-tag">{course.dept}</span>}
                  {course.semester && <span className="course-tag">{course.semester}</span>}
                </div>

                {isEnrolled ? (
                  <button
                    className="unenroll-btn"
                    onClick={() => handleUnenroll(course.id)}
                  >
                    ✓ Enrolled
                  </button>
                ) : (
                  <button
                    className="enroll-btn"
                    onClick={() => handleEnroll(course.id)}
                  >
                    + Enroll
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Courses;
