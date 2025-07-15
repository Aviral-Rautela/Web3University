import React, { useState } from 'react';
import { ArrowLeft, Plus, X, HelpCircle } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const QuizBuilder = ({ course, onBack, onQuizCreated }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    lessonId: '',
    passingScore: 70,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
      const question = {
        ...currentQuestion,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, question]
      }));
      
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      });
    }
  };

  const removeQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await web3University_backend.create_quiz(
        course.id,
        quizData.lessonId,
        quizData.title,
        quizData.questions,
        quizData.passingScore
      );

      if (result.Ok) {
        onQuizCreated();
      } else {
        console.error('Failed to create quiz:', result.Err);
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
                <p className="text-sm text-gray-600">for {course.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizChange}
                  className="input-field"
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div>
                <label className="form-label">Select Lesson</label>
                <select
                  name="lessonId"
                  value={quizData.lessonId}
                  onChange={handleQuizChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a lesson</option>
                  {course.lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  name="passingScore"
                  value={quizData.passingScore}
                  onChange={handleQuizChange}
                  className="input-field"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Question</label>
                  <textarea
                    name="question"
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                    className="input-field"
                    rows={3}
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="form-label">Options</label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={currentQuestion.correctAnswer === index}
                          onChange={(e) => setCurrentQuestion(prev => ({
                            ...prev,
                            correctAnswer: parseInt(e.target.value)
                          }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 input-field"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>

                <div>
                  <label className="form-label">Points</label>
                  <input
                    type="number"
                    name="points"
                    value={currentQuestion.points}
                    onChange={handleQuestionChange}
                    className="input-field w-24"
                    min="1"
                    max="100"
                  />
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt.trim())}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            {quizData.questions.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Questions</h3>
                <div className="space-y-4">
                  {quizData.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <HelpCircle className="h-5 w-5 text-gray-500" />
                            <h4 className="font-medium text-gray-900">
                              Question {index + 1}
                            </h4>
                            <span className="text-sm text-gray-500">
                              ({question.points} points)
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{question.question}</p>
                          <div className="space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <span className={`text-sm ${
                                  optionIndex === question.correctAnswer
                                    ? 'text-green-600 font-medium'
                                    : 'text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                  {optionIndex === question.correctAnswer && ' ✓'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onBack}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !quizData.title || !quizData.lessonId || quizData.questions.length === 0}
                className="btn btn-primary disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;