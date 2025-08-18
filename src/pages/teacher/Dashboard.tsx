//
import CourseManagement from '../admin/courses/CourseManagement'

const TeacherDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="text-gray-600 mt-1">Quick actions for your sessions and attendance</p>
                </div>

                {/* Quick action cards removed for teacher dashboard */}

                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Courses</h2>
                    <CourseManagement />
                </div>
            </div>
        </div>
    )
}

export default TeacherDashboard


