import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ exam: '', phone: '' });
  const [bulkData, setBulkData] = useState([]);

  // 1. Mock Data fetching (Jab backend ready ho jaye toh fetch use karenge)
  useEffect(() => {
    // Yahan backend se users ki list aayegi
    // fetch('/api/admin/users-report').then(res => res.json()).then(data => setUsers(data))
  }, []);

  // 2. CSV Bulk Upload Logic
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log("Parsed Questions:", results.data);
        // Backend API Call
        try {
          const response = await fetch('https://rankset-4nlg.onrender.com/api/admin/bulk-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results.data),
          });
          if (response.ok) alert("✅ Bulk Questions Uploaded Successfully!");
        } catch (err) {
          alert("❌ Upload failed. Check Backend connection.");
        }
      },
    });
  };

  // 3. Download Report Logic (CSV format)
  const downloadReport = (data, fileName) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Top Navigation / Header */}
      <div className="bg-rankset-blue text-white p-6 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rankset Admin Panel</h1>
        <div className="text-sm bg-white/20 px-4 py-2 rounded">Role: Super Admin</div>
      </div>

      {/* AdSense Space Placeholder (Non-irritating) */}
      <div className="max-w-6xl mx-auto my-4 h-24 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 rounded-lg">
        Ads Space (Google AdSense) - 728 x 90
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        
        {/* Left Column: Upload & Management */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 4 & 5: Question Upload */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Add Questions (Manual/Bulk)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <p className="text-sm font-semibold mb-2">Upload Bulk CSV</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCSVUpload}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rankset-blue file:text-white"
                />
                <p className="text-[10px] text-gray-400 mt-2">*CSV must have: subject, questionText, option1, option2, option3, option4, correctAnswer, language</p>
              </div>
              <div className="p-4 border rounded-lg flex flex-col justify-center items-center">
                <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 w-full">
                  + Add Single Question
                </button>
                <p className="text-[10px] text-gray-400 mt-2">Supports LaTeX ($...$) and Images</p>
              </div>
            </div>
          </div>

          {/* Section 3: User Management Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">Manage Users</h2>
              <button onClick={() => downloadReport(users, 'All_Users')} className="text-blue-600 text-sm font-semibold">Download All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Exam</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Mock User Row */}
                  <tr>
                    <td className="p-3">Hemanth S.</td>
                    <td className="p-3">UPSSSC Lekhpal</td>
                    <td className="p-3">9876543210</td>
                    <td className="p-3">
                      <button className="text-red-500 hover:underline">Block</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Reports & Filters */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Reports Filter</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Exam Wise</label>
                <select className="w-full mt-1 p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none">
                  <option>Select Exam</option>
                  <option>UPSSSC Lekhpal</option>
                  <option>SSC GD</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Search by Phone</label>
                <input 
                  type="text" 
                  placeholder="Enter phone number..."
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <button className="w-full bg-rankset-blue text-white py-3 rounded-lg font-bold shadow-lg hover:brightness-110 transition-all">
                Download Filtered Report
              </button>
            </div>
          </div>

          {/* AdSense Vertical Space */}
          <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
            Sidebar Ad Space
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;