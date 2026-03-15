import React, { useState, useEffect } from 'react';

const TestScreen = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIndex });
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Timer */}
      <div className="bg-rankset-blue text-white p-4 flex justify-between items-center sticky top-0 shadow-md">
        <h2 className="font-bold">Rankset Test Portal</h2>
        <div className="bg-red-500 px-3 py-1 rounded-full font-mono font-bold">
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Google AdSense Space (Middle) */}
      <div className="w-full h-16 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border-b">
        ADVERTISEMENT - GOOGLE ADSENSE
      </div>

      {/* Question Area */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500 font-semibold">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Subject: {currentQ.subject}</span>
        </div>

        {/* Question Text (LaTeX compatible) */}
        <div className="text-lg font-medium mb-6 leading-relaxed">
          {currentQ.questionText}
          {currentQ.imageUrl && <img src={currentQ.imageUrl} alt="question" className="mt-4 rounded-lg" />}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full p-4 text-left border rounded-xl transition-all ${
                selectedAnswers[currentIndex] === idx 
                ? 'border-rankset-blue bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Bottom Bar) */}
      <div className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="px-6 py-2 text-gray-600 font-semibold disabled:opacity-30"
        >
          PREVIOUS
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-green-700">
            SUBMIT TEST
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="bg-rankset-blue text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700"
          >
            NEXT
          </button>
        )}
      </div>
    </div>
  );
};

export default TestScreen;