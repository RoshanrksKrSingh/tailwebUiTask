import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssignments, createAssignment, updateStatus, 
  fetchSubmissions, markReviewed, deleteAssignment, editAssignment 
} from '../redux/assignmentSlice';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal'; 

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { items, submissions, isLoading } = useSelector((state) => state.assignments);
  
  const [filter, setFilter] = useState(''); 
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null, newStatus: null, actionType: null, message: '' });

  useEffect(() => {
    dispatch(fetchAssignments(filter));
  }, [filter, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      return toast.warn("Please fill in all fields.");
    }
    
    setIsSubmitting(true);
    try {
      if (editId) {
        await dispatch(editAssignment({ id: editId, data: formData })).unwrap();
        toast.success("Assignment updated!");
        setEditId(null);
      } else {
        await dispatch(createAssignment(formData)).unwrap();
        toast.success("Assignment created!");
      }
      setFormData({ title: '', description: '', dueDate: '' });
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (assign) => {
    setEditId(assign._id);
    setFormData({ 
      title: assign.title, 
      description: assign.description, 
      dueDate: new Date(assign.dueDate).toISOString().split('T')[0] 
    });
    window.scrollTo(0,0);
  };

  const initiateAction = (id, newStatus, actionType) => {
    let msg = '';
    if (actionType === 'DELETE') msg = "Are you sure you want to DELETE this draft?";
    else msg = `Are you sure you want to change status to ${newStatus}?`;

    setModalConfig({ isOpen: true, id, newStatus, actionType, message: msg });
  };

  const executeAction = async () => {
    const { id, newStatus, actionType } = modalConfig;
    try {
      if (actionType === 'DELETE') {
        await dispatch(deleteAssignment(id)).unwrap();
        toast.success("Assignment Deleted");
      } else {
        await dispatch(updateStatus({ id, status: newStatus })).unwrap();
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Action Failed");
    }
  };

  const handleViewSubmissions = (assignmentId) => {
    if (activeAssignmentId === assignmentId) {
      setActiveAssignmentId(null);
    } else {
      setActiveAssignmentId(assignmentId);
      dispatch(fetchSubmissions(assignmentId));
    }
  };

  const handleReview = async (submissionId) => {
    try {
      await dispatch(markReviewed(submissionId)).unwrap();
      toast.success("Submission Reviewed");
    } catch (error) {
      toast.error("Failed to mark reviewed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeAction}
        message={modalConfig.message}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
      </div>

      {/* Form */}
      <div className={`bg-white p-6 rounded shadow mb-8 border-t-4 ${editId ? 'border-orange-500' : 'border-purple-500'}`}>
        <h3 className={`text-xl font-bold mb-4 ${editId ? 'text-orange-700' : 'text-purple-700'}`}>
          {editId ? 'Edit Assignment' : 'Create New Assignment'}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input placeholder="Title" className="border p-2 rounded" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <input placeholder="Description" className="border p-2 rounded" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <input type="date" className="border p-2 rounded" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
          <button disabled={isSubmitting} className={`text-white p-2 rounded font-bold ${editId ? 'bg-orange-500' : 'bg-purple-600'}`}>
            {isSubmitting ? 'Saving...' : (editId ? 'Update Draft' : 'Create Draft')}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['', 'DRAFT', 'PUBLISHED', 'COMPLETED'].map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-1 rounded-full text-sm font-medium ${filter === status ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
            {status || 'ALL'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-4">
        {items.map(assign => (
          <div key={assign._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{assign.title}</h3>
                <p className="text-gray-600">{assign.description}</p>
                <p className="text-sm text-gray-500">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${assign.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : assign.status === 'COMPLETED' ? 'bg-gray-800 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
                  {assign.status}
                </span>

                <div className="flex gap-2 flex-wrap justify-end">
                  
                  {/* DRAFT: Edit, Delete, Publish */}
                  {assign.status === 'DRAFT' && (
                    <>
                      <button onClick={() => handleEditClick(assign)} className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">Edit</button>
                      <button onClick={() => initiateAction(assign._id, null, 'DELETE')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                      <button onClick={() => initiateAction(assign._id, 'PUBLISHED', 'UPDATE')} className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">Publish</button>
                    </>
                  )}

                  {/* PUBLISHED: View, Mark Completed */}
                  {assign.status === 'PUBLISHED' && (
                    <>
                      <button onClick={() => handleViewSubmissions(assign._id)} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600">
                        {activeAssignmentId === assign._id ? 'Hide Submissions' : 'View Submissions'}
                      </button>
                      <button onClick={() => initiateAction(assign._id, 'COMPLETED', 'UPDATE')} className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-900">Mark Completed</button>
                    </>
                  )}

                  {/* COMPLETED: View (Locked) */}
                  {assign.status === 'COMPLETED' && (
                     <button onClick={() => handleViewSubmissions(assign._id)} className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600">View Submissions</button>
                  )}
                </div>
              </div>
            </div>

            {/* Submissions Dropdown */}
            {activeAssignmentId === assign._id && (
              <div className="bg-gray-50 p-5 border-t">
                <h4 className="font-bold text-gray-700 mb-3">Student Submissions</h4>
                {submissions.length === 0 ? <p className="text-sm text-gray-500">No submissions found.</p> : (
                  <div className="space-y-3">
                    {submissions.map(sub => (
                      <div key={sub._id} className="bg-white p-3 rounded border flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">{sub.studentId?.name || 'Unknown'}</p>
                          <p className="text-gray-700 mt-1 bg-gray-100 p-2 rounded">{sub.answer}</p>
                          <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                           {sub.isReviewed ? (
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Reviewed</span>
                           ) : (
                             <button onClick={() => handleReview(sub._id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Mark Reviewed</button>
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
      </div>
    </div>
  );
};

export default TeacherDashboard;