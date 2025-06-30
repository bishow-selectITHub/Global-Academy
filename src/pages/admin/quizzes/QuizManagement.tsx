import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ui/Toaster';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Loader2, Plus, Edit, CheckCircle } from 'lucide-react';

interface CourseWithQuiz {
    id: string;
    title: string;
    thumbnail: string;
    quizStatus: 'Published' | 'Draft' | 'No Quiz';
    questionCount: number;
}

const QuizManagement = () => {
    const [courses, setCourses] = useState<CourseWithQuiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchCoursesAndQuizzes = async () => {
            setIsLoading(true);
            try {
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('id, title, thumbnail');

                if (coursesError) throw coursesError;
                if (!coursesData) return;

                const courseIds = coursesData.map(c => c.id);
                const { data: quizzesData, error: quizzesError } = await supabase
                    .from('quizes')
                    .select('course_id, isPublished, questions')
                    .in('course_id', courseIds);

                if (quizzesError) throw quizzesError;

                const coursesWithQuizInfo = coursesData.map(course => {
                    const quiz = quizzesData?.find(q => q.course_id === course.id);
                    let quizStatus: 'Published' | 'Draft' | 'No Quiz' = 'No Quiz';
                    if (quiz) {
                        quizStatus = quiz.isPublished ? 'Published' : 'Draft';
                    }
                    const questionCount = quiz?.questions?.length || 0;

                    return {
                        ...course,
                        quizStatus,
                        questionCount,
                    };
                });

                setCourses(coursesWithQuizInfo);

            } catch (err: any) {
                addToast({ type: 'error', title: 'Error fetching data', message: err.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoursesAndQuizzes();
    }, [addToast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Quiz Management</h1>
                <p className="text-slate-600">Select a course to build or manage its quiz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <Card key={course.id} className="flex flex-col">
                        <CardHeader>
                            <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
                            <CardTitle className="mt-4">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <span>Quiz Status:</span>
                                <span className={`font-semibold px-2 py-1 rounded-full text-xs ${course.quizStatus === 'Published' ? 'bg-green-100 text-green-700' :
                                        course.quizStatus === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {course.quizStatus}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-500 mt-2">
                                <span>Questions:</span>
                                <span className="font-semibold">{course.questionCount}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link to={`/admin/courses/${course.id}/quiz`} className="w-full">
                                <Button variant="primary" fullWidth leftIcon={course.quizStatus === 'No Quiz' ? <Plus size={16} /> : <Edit size={16} />}>
                                    {course.quizStatus === 'No Quiz' ? 'Build Quiz' : 'Edit Quiz'}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuizManagement; 