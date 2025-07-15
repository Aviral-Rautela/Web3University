import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const QuizAttempt = ({ quiz, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await web3University_backend.attempt_quiz(quiz.id, answers);
      if (result.Ok) {
        setQuizResult(result.Ok);
        setShowResults(true);
      } else {
        console.error('Quiz submission failed:', result.Err);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isQuizComplete = () => {
    return answers.every(answer => answer !== null);
  };

  const getScorePercentage = () => {
    if (!quizResult) return 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    return Math.round((quizResult.score / totalPoints) * 100);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Quiz Results</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                quizResult.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {quizResult.passed ? (
                  <Trophy className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {quizResult.passed ? 'Congratulations!' : 'Try Again'}
              </h2>
              <p className="text-gray-600 mb-4">
                {quizResult.passed 
                  ? 'You have successfully passed the quiz!'
                  : 'You need to score higher to pass this quiz.'
                }
              </p>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {getScorePercentage()}%
              </div>
              <p className="text-gray-600">
                You scored {quizResult.score} out of {quiz.questions.reduce((sum, q) => sum + q.points, 0)} points
              </p>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div key={question.id} className="border rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                optionIndex === question.correct_answer
                                  ? 'bg-green-50 border-green-200'
                                  : optionIndex === userAnswer && !isCorrect
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="text-sm">{option}</span>
                                {optionIndex === question.correct_answer && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {optionIndex === userAnswer && !isCorrect && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={onComplete}
                className="btn btn-primary"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>No time limit</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      answers[currentQuestion] === index
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-primary-600 text-white'
                      : answers[index] !== null
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!isQuizComplete() || isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentQuestion === quiz.questions.length - 1}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;