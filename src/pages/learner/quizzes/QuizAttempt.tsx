import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../../../store/quizzesSlice';
import { RootState } from '../../../store';

const QuizAttempt = () => {
  const dispatch = useDispatch();
  const { data: quizzes, loading, error } = useSelector((state: RootState) => state.quizzes);

  useEffect(() => {
    if (!quizzes || quizzes.length === 0) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, quizzes]);

  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.map((quiz: any) => (
          <li key={quiz.id}>{quiz.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuizAttempt;