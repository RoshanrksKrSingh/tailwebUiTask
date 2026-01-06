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
    if (!answerText || !answerText.trim()) return toast.error("Please write an answer.");

    setSubmittingId(id);
    try {
      await dispatch(submitAssignment({ assignmentId: id, answer: answerText })).unwrap();
      toast.success("Assignment Submitted!");
      setAnswers(prev => ({...prev, [id]: ''})); 
      dispatch(fetchAssignments()); // Refresh UI
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Failed to submit");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Dashboard</h1>

      {isLoading ? <div className="text-center text-purple-600 font-bold animate-pulse">Loading...</div> : (
        <div className="grid gap-6">
          {items.map(assign => {
            const mySub = assign.yourSubmission;
            const isSubmitted = !!mySub;

            return (
              <div key={assign._id} className="bg-white p-6 rounded shadow border-l-4 border-purple-400">
                <div className="mb-4">
                  <h3 className="font-bold text-xl">{assign.title}</h3>
                  <p className="text-gray-700">{assign.description}</p>
                  <p className="text-sm text-red-500 font-semibold mt-1">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                </div>

                {/* VIEW MODE: Read Only if submitted */}
                {isSubmitted ? (
                  <div className="bg-gray-100 p-4 rounded border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-600 uppercase">Your Answer:</span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">SUBMITTED</span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{mySub.answer}</p>
                    <p className="text-xs text-gray-400 mt-2">Submitted on: {new Date(mySub.submittedAt).toLocaleString()}</p>
                    {mySub.isReviewed && <p className="text-xs text-blue-600 font-bold mt-1">✓ Reviewed by Teacher</p>}
                  </div>
                ) : (
                  /* SUBMIT MODE */
                  <div>
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
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
                    >
                      {submittingId === assign._id ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && <p className="text-center text-gray-500">No active assignments.</p>}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;