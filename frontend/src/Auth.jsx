import React, { useState } from 'react';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', examName: '', email: '', phone: '', password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Yahan hum backend ko data bhejenge
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert(isLogin ? "Login Successful!" : "Registration Successful! Now Login.");
        if (isLogin) onLoginSuccess(data.user);
        else setIsLogin(true);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      alert("Backend server is not running!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1a73e8] italic">RANKSET</h1>
          <p className="text-gray-400 text-sm mt-2">{isLogin ? 'Welcome Back!' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Father's Name" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setFormData({...formData, fatherName: e.target.value})} required />
              <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 text-gray-500" onChange={(e) => setFormData({...formData, examName: e.target.value})} required>
                <option value="">Select Competitive Exam</option>
                <option value="UPSSSC Lekhpal">UPSSSC Lekhpal</option>
                <option value="SSC GD">SSC GD</option>
                <option value="Railway NTPC">Railway NTPC</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email ID" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          {!isLogin && <input type="tel" placeholder="Phone Number" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setFormData({...formData, phone: e.target.value})} required />}
          <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          
          <button type="submit" className="w-full bg-[#1a73e8] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all">
            {isLogin ? 'Login' : 'Register Now'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 font-semibold hover:underline">
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
        
        {isLogin && (
          <div className="mt-2 text-center">
            <button className="text-xs text-gray-400 hover:text-blue-500">Forgot Password?</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;