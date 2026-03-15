import React from 'react';

const ResultPage = ({ score, total, results, questions }) => {
  // 1. Social Media Sharing Logic (Web Share API - Free & Best for PWA)
  const shareResult = () => {
    const shareText = `Hey! I just scored ${score}/${total} on Rankset Exam. Can you beat my rank? 🏆\nCheck it out here: https://rankset.vercel.app`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Rankset Result',
        text: shareText,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for Desktop/Browsers that don't support native share
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner with Score */}
      <div className="bg-rankset-blue text-white p-10 text-center rounded-b-[3rem] shadow-xl">
        <h1 className="text-xl opacity-80 uppercase tracking-widest">Test Completed!</h1>
        <div className="text-6xl font-black my-4">{Math.round((score / total) * 100)}%</div>
        <p className="text-lg">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{total}</span></p>
        
        {/* AdSense Space inside Result */}
        <div className="mt-6 h-12 bg-white/10 rounded flex items-center justify-center text-[10px] border border-white/20">
          AD REVENUE SPACE
        </div>
      </div>

      <div className="max-w-md mx-auto -mt-8 p-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={shareResult}
            className="bg-green-500 text-white p-4 rounded-2xl shadow-lg font-bold flex flex-col items-center justify-center hover:scale-105 transition"
          >
            <span className="text-2xl mb-1">WhatsApp</span>
            <span className="text-xs opacity-80">Share Result</span>
          </button>
          <button 
            className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg font-bold flex flex-col items-center justify-center hover:scale-105 transition"
            onClick={() => alert('Feature coming soon: Instagram Story generator!')}
          >
            <span className="text-2xl mb-1">Instagram</span>
            <span className="text-xs opacity-80">Post Story</span>
          </button>
        </div>

        {/* Mistakes Section (Review Mode) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">Check Your Mistakes</h2>
          
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={idx} className="border-l-4 p-4 rounded-r-lg bg-gray-50" 
                style={{ borderColor: results[idx] === q.correctAnswer ? '#22c55e' : '#ef4444' }}>
                <p className="text-sm font-bold text-gray-400 mb-2 font-mono">QUESTION {idx + 1}</p>
                <p className="text-gray-800 font-medium mb-3">{q.questionText}</p>
                
                <div className="text-sm space-y-1">
                  <p className="text-red-500 font-semibold">Your Answer: {q.options[results[idx]] || "Skipped"}</p>
                  <p className="text-green-600 font-semibold">Correct Answer: {q.options[q.correctAnswer]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Ad */}
      <div className="fixed bottom-0 w-full h-16 bg-white border-t flex items-center justify-center shadow-2xl">
         <span className="text-gray-300 text-xs italic">Google AdSense Banner</span>
      </div>
    </div>
  );
};

export default ResultPage;