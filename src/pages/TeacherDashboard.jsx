import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssignments, 
  createAssignment, 
  updateStatus, 
  fetchSubmissions, 
  markRedo          
} from '../redux/assignmentSlice';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal'; 

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { items, submissions, isLoading } = useSelector((state) => state.assignments);
  
  const [filter, setFilter] = useState(''); 
  const [newAssign, setNewAssign] = useState({ title: '', description: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track which assignment is expanded to show submissions
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    id: null, 
    newStatus: null, 
    message: '' 
  });

  useEffect(() => {
    dispatch(fetchAssignments(filter));
  }, [filter, dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!newAssign.title.trim() || !newAssign.description.trim() || !newAssign.dueDate) {
      return toast.warn("Please fill in all fields.");
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(createAssignment(newAssign)).unwrap();
      toast.success("Assignment created successfully!");
      setNewAssign({ title: '', description: '', dueDate: '' });
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Change Logic
  const initiateStatusChange = (id, newStatus) => {
    setModalConfig({
      isOpen: true,
      id,
      newStatus,
      message: `Are you sure you want to change the status to ${newStatus}?`
    });
  };

  const executeStatusChange = async () => {
    const { id, newStatus } = modalConfig;
    try {
      await dispatch(updateStatus({ id, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // --- NEW LOGIC: View Submissions ---
  const handleViewSubmissions = (assignmentId) => {
    if (activeAssignmentId === assignmentId) {
      setActiveAssignmentId(null); // Toggle off
    } else {
      setActiveAssignmentId(assignmentId);
      dispatch(fetchSubmissions(assignmentId)); // Fetch data
    }
  };

  const handleMarkRedo = async (submissionId) => {
    try {
      await dispatch(markRedo(submissionId)).unwrap();
      toast.success("Marked for Redo successfully");
    } catch (error) {
      toast.error("Failed to mark redo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeStatusChange}
        message={modalConfig.message}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
      </div>

      {/* Create Form */}
      <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-purple-500">
        <h3 className="text-xl font-bold mb-4 text-purple-700">Create New Assignment</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input 
            placeholder="Title" 
            className="border p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none" 
            value={newAssign.title} 
            onChange={(e) => setNewAssign({...newAssign, title: e.target.value})} 
          />
          <input 
            placeholder="Description" 
            className="border p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none" 
            value={newAssign.description} 
            onChange={(e) => setNewAssign({...newAssign, description: e.target.value})} 
          />
          <input 
            type="date" 
            className="border p-2 rounded focus:ring-2 focus:ring-purple-300 outline-none" 
            value={newAssign.dueDate} 
            onChange={(e) => setNewAssign({...newAssign, dueDate: e.target.value})} 
          />
          <button 
            disabled={isSubmitting}
            className={`text-white p-2 rounded font-bold transition-colors ${
              isSubmitting ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Draft'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center flex-wrap gap-2">
        <span className="mr-3 font-bold text-gray-700">Filter by Status:</span>
        {['', 'DRAFT', 'PUBLISHED', 'COMPLETED'].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === status 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border hover:bg-purple-50'
            }`}
          >
            {status || 'ALL'}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {isLoading && !items.length ? (
         <div className="text-center text-purple-600 mt-10 font-bold animate-pulse">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {items.map(assign => (
            <div key={assign._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{assign.title}</h3>
                  <p className="text-gray-600">{assign.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${assign.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
                      assign.status === 'COMPLETED' ? 'bg-gray-800 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                    {assign.status}
                  </span>
                  
                  <div className="flex gap-2 mt-2 flex-wrap justify-end">
                    {/* VIEW SUBMISSIONS BUTTON (New) */}
                    <button 
                      onClick={() => handleViewSubmissions(assign._id)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
                    >
                      {activeAssignmentId === assign._id ? 'Hide Submissions' : 'View Submissions'}
                    </button>

                    {assign.status === 'DRAFT' && (
                      <button 
                        onClick={() => initiateStatusChange(assign._id, 'PUBLISHED')}
                        className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                      >
                        Publish
                      </button>
                    )}

                    {assign.status === 'PUBLISHED' && (
                      <>
                        <button 
                          onClick={() => initiateStatusChange(assign._id, 'DRAFT')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Back to Draft
                        </button>
                        <button 
                          onClick={() => initiateStatusChange(assign._id, 'COMPLETED')}
                          className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900"
                        >
                          Mark Completed
                        </button>
                      </>
                    )}

                    {assign.status === 'COMPLETED' && (
                      <button 
                        onClick={() => initiateStatusChange(assign._id, 'PUBLISHED')}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* --- SUBMISSIONS DROPDOWN SECTION --- */}
              {activeAssignmentId === assign._id && (
                <div className="bg-gray-50 p-5 border-t border-gray-200">
                  <h4 className="font-bold text-gray-700 mb-3">Student Submissions</h4>
                  {submissions.length === 0 ? (
                    <p className="text-sm text-gray-500">No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map(sub => (
                        <div key={sub._id} className="bg-white p-3 rounded border flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm">{sub.studentId?.name || 'Unknown Student'}</p>
                            <p className="text-gray-600 text-sm mt-1">{sub.answer}</p>
                            <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${
                               sub.status === 'REDO_REQUESTED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                             }`}>
                               {sub.status}
                             </span>
                             
                             {/* REDO BUTTON */}
                             {sub.status !== 'REDO_REQUESTED' && (
                               <button 
                                 onClick={() => handleMarkRedo(sub._id)}
                                 className="block mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                               >
                                 Allow Redo
                               </button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
          {items.length === 0 && <p className="text-center text-gray-500 py-8">No assignments found.</p>}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;