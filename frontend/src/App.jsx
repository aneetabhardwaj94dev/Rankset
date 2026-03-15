import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import TestScreen from './TestScreen';
import ResultPage from './ResultPage';
import Auth from './Auth';



function App() {
  // Screens handle karne ke liye state: 'home', 'test', 'result', 'admin'
  // App function ke shuruat mein ye lines daalein
const [user, setUser] = useState(null);

if (!user) {
  return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
}

// ... baaki ka purana return wala code yahan rahega

  // Mock data for testing (Jab backend full connect hoga tab wahan se aayega)
  const mockQuestions = [
    {
      subject: "Physics",
      questionText: "What is the unit of Electric Potential? $V = IR$",
      options: ["Ohm", "Ampere", "Volt", "Watt"],
      correctAnswer: 2
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Header Section */}
      <nav className="bg-[#1a73e8] p-4 text-white flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl focus:outline-none">☰</button>
          <h1 className="text-xl font-bold tracking-tighter italic">RANKSET</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm hidden md:block font-medium">Hemanth S.</span>
          <div className="w-9 h-9 bg-white text-[#1a73e8] rounded-full flex items-center justify-center font-bold shadow-sm">H</div>
        </div>
      </nav>

      {/* 2. Sidebar (Sandwich Menu) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div className="w-72 h-full bg-white shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-[#1a73e8]">RANKSET</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            
            <ul className="space-y-2 flex-1">
              <li onClick={() => {setView('home'); setSidebarOpen(false)}} className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-gray-600 hover:text-blue-600 transition">🏠 Home</li>
              <li onClick={() => {setView('admin'); setSidebarOpen(false)}} className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-gray-600 hover:text-blue-600 transition">⚙️ Admin Panel</li>
              <li className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-gray-600 hover:text-blue-600 transition">📊 My Rankings</li>
              <li className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-gray-600 hover:text-blue-600 transition">📜 Privacy Policy</li>
            </ul>

            <div className="border-t pt-4">
               <button className="w-full text-left p-3 text-red-500 font-bold hover:bg-red-50 rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AdSense Top Banner Placeholder */}
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className="w-full h-24 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-sm italic">
          Google AdSense Banner Space (728x90)
        </div>
      </div>

      {/* 4. Main Dynamic Content */}
      <main className="max-w-4xl mx-auto p-4">
        {view === 'home' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Taiyari Shuru Karein?</h2>
              <p className="text-gray-500 max-w-xs mx-auto">Latest UPSSSC, SSC and Railway tests are live for you.</p>
              <button 
                onClick={() => setView('test')}
                className="w-full bg-[#1a73e8] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                Start New Test
              </button>
            </div>

            {/* Overall Rank Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Your Overall Rank</p>
                  <h3 className="text-4xl font-black mt-1">#114</h3>
                  <p className="text-xs text-blue-200 mt-2">Better than 82% of students in your exam category.</p>
               </div>
               <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-bold italic">#</div>
            </div>
          </div>
        )}

        {view === 'test' && (
          <TestScreen questions={mockQuestions} onFinish={() => setView('result')} />
        )}

        {view === 'result' && (
          <ResultPage score={1} total={1} results={{0: 2}} questions={mockQuestions} />
        )}

        {view === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* AdSense Fixed Bottom for Mobile */}
      <div className="fixed bottom-0 left-0 w-full h-14 bg-white border-t flex items-center justify-center text-[10px] text-gray-400 z-40">
        STICKY AD SPACE
      </div>
    </div>
  );
}

export default App;