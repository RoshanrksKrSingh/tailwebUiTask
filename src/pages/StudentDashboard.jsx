import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, submitAssignment } from '../redux/assignmentSlice';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.assignments);
  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const handleSubmit = async (id) => {
    const answerText = answers[id];

    if (!answerText || !answerText.trim()) {
      return toast.error("Please write an answer before submitting.");
    }

    setSubmittingId(id);
    try {
      // unwrap allows us to catch the rejected value (error message)
      await dispatch(submitAssignment({ assignmentId: id, answer: answerText })).unwrap();
      
      toast.success("Assignment Submitted Successfully!");
      setAnswers(prev => ({...prev, [id]: ''})); 
      
    } catch (error) {
      // Safe error handling: Ensure error is a string before checking contents
      const errorMsg = typeof error === 'string' ? error : (error.message || "Unknown error");

      if (errorMsg.toLowerCase().includes("already submitted")) {
        toast.warning("You have already submitted this assignment. Wait for teacher review.");
      } else {
        toast.error(errorMsg || "Failed to submit assignment");
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="text-center text-purple-500 font-bold animate-pulse">Loading Tasks...</div>
      ) : (
        <div className="grid gap-6">
          {items.length === 0 ? <p className="text-center text-gray-500">No active assignments available.</p> : items.map(assign => (
            <div key={assign._id} className="bg-white p-6 rounded shadow hover:shadow-md transition-shadow border-l-4 border-purple-400">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{assign.title}</h3>
                  <p className="text-gray-700 mb-2">{assign.description}</p>
                  <p className="text-sm text-red-500 mb-4 font-semibold">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                </div>
                {/* Optional: You can assume 'status' if your backend sends it, otherwise this logic relies on the submit error */}
              </div>
              
              <textarea 
                className="w-full border p-3 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Type your answer here..."
                rows="3"
                value={answers[assign._id] || ''}
                onChange={(e) => setAnswers({...answers, [assign._id]: e.target.value})}
              ></textarea>
              
              <button 
                onClick={() => handleSubmit(assign._id)}
                disabled={submittingId === assign._id}
                className={`text-white px-4 py-2 rounded transition-colors font-medium ${
                  submittingId === assign._id 
                    ? 'bg-purple-300 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {submittingId === assign._id ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;