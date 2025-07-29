import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useUser } from '../../contexts/UserContext';

const MyCourses = () => {
  const { user } = useUser();
  const enrollments = useSelector((state: RootState) => state.enrollments.data);
  const courses = useSelector((state: RootState) => state.courses.data);

  // Only show courses where the user is enrolled
  const myEnrollments = enrollments.filter((e: any) => e.user_id === user.id);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myEnrollments.map((enrollment: any) => {
          const course = courses.find((c: any) => c.id === enrollment.course_id);
          if (!course) return null;
          return (
            <div key={course.id} className="p-4 border rounded">
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p>Progress: {enrollment.progress || 0}%</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Continue</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses; 