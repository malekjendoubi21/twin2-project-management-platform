import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import api from '../../utils/Api';
import { toast } from 'react-hot-toast';


const TaskModal = ({ 
  isOpen, 
  onClose, 
  task, 
  projectId, 
  users, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask,
  modalRef 
}) => {
  const { id: workspaceId } = useParams(); 
  // Get workspace ID from URL
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    estimated_time: 1,
    actual_time: 0,
    assigned_to: '',
    deadline: new Date().toISOString().split('T')[0],
  });
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [findingMatch, setFindingMatch] = useState(false);
  const [autoCompletingAssignee, setAutoCompletingAssignee] = useState(false);
  const [bestMatchName, setBestMatchName] = useState("");
  
  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      let assignedToValue = '';
      if (task.assigned_to) {
        if (typeof task.assigned_to === 'object' && task.assigned_to._id) {
          assignedToValue = task.assigned_to._id;
        } else if (typeof task.assigned_to === 'object' && task.assigned_to.id) {
          assignedToValue = task.assigned_to.id;
        } else {
          assignedToValue = task.assigned_to; // Already a string
        }
      }
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        estimated_time: task.estimated_time || 1,
        actual_time: task.actual_time || 0,
        assigned_to: assignedToValue,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      // Set default assignee to first user if available
      if (users.length > 0) {
        setFormData(prev => ({ ...prev, assigned_to: users[0]._id }));
      }
    }
  }, [task, users]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Update the findBestMatch function with increased timeout
  const findBestMatch = async () => {
    if (!formData.description) {
      toast.error('Please provide a task description first');
      return;
    }
    
    setFindingMatch(true);
    try {
      console.log(`Finding match for workspace ${workspaceId} with description: ${formData.description.substring(0, 30)}...`);
      
      const response = await api.post('/api/match-profiles', {
        workspace_id: workspaceId,
        task_description: formData.description
      }, {
        timeout: 60000 // Increase timeout to 60 seconds
      });
      
      if (response.data && response.data.length > 0) {
        // Get the highest scoring member
        const bestMatch = response.data[0];
        
        // Set state for animation
        setBestMatchName(bestMatch.name);
        setAutoCompletingAssignee(true);
        
        // Delay updating the form to allow animation to show
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            assigned_to: bestMatch.id
          }));
          
          // End animation after another short delay
          setTimeout(() => {
            setAutoCompletingAssignee(false);
            toast.success(`${bestMatch.name} is the best match for this task`);
          }, 2000);
        }, 1500);
        
        console.log('Match results:', response.data);
      } else {
        toast.error('No suitable team members found');
      }
    } catch (error) {
      console.error('Error finding best match:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. The matching process is taking too long.');
      } else {
        const errorMessage = error.response?.data?.error || 'Could not find a matching team member';
        toast.error(errorMessage);
      }
    } finally {
      setFindingMatch(false);
    }
  };
  
  // Modify the handleSubmit function
// Modify the handleSubmit function to debug the issue

// Fix the handleSubmit function to properly extract user ID

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Helper to extract the correct ID from assigned_to regardless of format
  const extractUserId = (assignedTo) => {
    if (!assignedTo) return null;
    
    // If it's already a string that's not "[object Object]", return it
    if (typeof assignedTo === 'string' && assignedTo !== "[object Object]") {
      return assignedTo;
    }
    
    // If it's an object with _id, return that ID
    if (typeof assignedTo === 'object' && assignedTo?._id) {
      return String(assignedTo._id);
    }
    
    // If it's an object with id, return that ID (some APIs use id instead of _id)
    if (typeof assignedTo === 'object' && assignedTo?.id) {
      return String(assignedTo.id);
    }
    
    // Default to null if we can't extract an ID
    return null;
  };
  
  // Format the data properly for API consumption
  const taskToSubmit = {
    title: formData.title,
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    estimated_time: Number(formData.estimated_time),
    actual_time: Number(formData.actual_time || 0),
    assigned_to: extractUserId(formData.assigned_to),
    deadline: formData.deadline,
    project_id: projectId
  };

  // Debug - log exact data being sent
  console.log('TaskModal - Submitting task with fixed ID format:', {
    id: task?._id,
    data: taskToSubmit
  });

  try {
    if (task) {
      const taskId = String(task._id);
      await onUpdateTask(taskId, taskToSubmit);
    } else {
      await onCreateTask(taskToSubmit);
    }
    onClose();
  } catch (error) {
    console.error('Error submitting task:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      toast.error(`Error: ${error.response.data.message || 'Unknown server error'}`);
    } else {
      toast.error('Failed to save task');
    }
  }
};
  
  // Handle delete
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setLoading(true);
    try {
      await onDeleteTask(task._id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Close modal when clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        className="bg-base-100 rounded-xl shadow-2xl max-w-xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          {/* Header accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-t-xl"></div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Task Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter task title"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the task..."
                  className="textarea textarea-bordered h-24"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered w-full"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              
              {/* Time Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Estimated Hours</span>
                  </label>
                  <input
                    type="number"
                    name="estimated_time"
                    min="0"
                    step="0.5"
                    className="input input-bordered w-full"
                    value={formData.estimated_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Actual Hours (if tracked)</span>
                  </label>
                  <input
                    type="number"
                    name="actual_time"
                    min="0"
                    step="0.5"
                    className="input input-bordered w-full"
                    value={formData.actual_time}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Assignee and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Improved AI matching button placement - now below the dropdown */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Assigned To</span>
                  </label>
                  
                  {/* Advanced Select dropdown with auto-completion animation */}
                  <div className="relative">
                    <select
                      name="assigned_to"
                      className={`select select-bordered w-full transition-all duration-300 ${
                        autoCompletingAssignee ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''
                      }`}
                      value={formData.assigned_to}
                      onChange={handleChange}
                      disabled={autoCompletingAssignee}
                      required
                    >
                      <option value="" disabled>Select a team member</option>
                      {users.map(user => (
                        <option key={user._id} value={String(user._id)}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* AI Auto-completion Animation Overlay */}
                    {autoCompletingAssignee && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        {/* Background Glow Effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                          animate={{ 
                            opacity: [0.3, 0.6, 0.3] 
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                        
                        {/* Particle Effects */}
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                              background: `rgba(${
                                i % 3 === 0 ? '147, 51, 234' : 
                                i % 3 === 1 ? '79, 70, 229' : 
                                '59, 130, 246'
                              }, ${0.6 + Math.random() * 0.4})`,
                              boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(${
                                i % 3 === 0 ? '147, 51, 234' : 
                                i % 3 === 1 ? '79, 70, 229' : 
                                '59, 130, 246'
                              }, 0.8)`
                            }}
                            initial={{ 
                              x: `${Math.random() * 100}%`, 
                              y: `${Math.random() * 100}%`, 
                              scale: 0,
                              opacity: 0
                            }}
                            animate={{ 
                              x: `${Math.random() * 100}%`,
                              y: `${Math.random() * 100}%`,
                              scale: [0, 1 + Math.random(), 0],
                              opacity: [0, 0.8, 0]
                            }}
                            transition={{
                              duration: 1.5 + Math.random(),
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatDelay: Math.random() * 0.5
                            }}
                          />
                        ))}
                        
                        {/* Scanning Light Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                          style={{ height: '200%' }}
                          animate={{ y: ['-100%', '0%'] }}
                          transition={{ 
                            duration: 1.5, 
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        />
                        
                        {/* Magic Sparkles */}
                        <div className="absolute inset-0 overflow-hidden">
                          {/* Modern 4-point AI shapes instead of stars */}
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={`sparkle-${i}`}
                              className="absolute"
                              style={{
                                top: `${10 + Math.random() * 80}%`,
                                left: `${10 + Math.random() * 80}%`,
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                y: [0, -10],
                                rotate: [0, Math.random() > 0.5 ? 45 : -45]
                              }}
                              transition={{
                                duration: 1 + Math.random(),
                                delay: Math.random() * 2,
                                repeat: Infinity,
                                repeatDelay: Math.random() * 3
                              }}
                            >
                              {/* 4-angled modern AI shapes */}
                              {i % 4 === 0 ? (
                                // Diamond shape
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    d="M12 2L22 12L12 22L2 12L12 2Z" 
                                    fill={i % 2 === 0 ? "#8B5CF6" : "#60A5FA"} 
                                    stroke="white" 
                                    strokeWidth="0.5"
                                  />
                                </svg>
                              ) : i % 4 === 1 ? (
                                // Square shape
                                <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect 
                                    x="2" y="2" 
                                    width="16" height="16" 
                                    fill="#8B5CF6" 
                                    stroke="white" 
                                    strokeWidth="0.5"
                                    transform="rotate(45 10 10)"
                                  />
                                </svg>
                              ) : i % 4 === 2 ? (
                                // Cross shape
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    d="M12 2V22M2 12H22" 
                                    stroke={i % 2 === 0 ? "#8B5CF6" : "#60A5FA"} 
                                    strokeWidth="4" 
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ) : (
                                // Plus shape with fill
                                <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    d="M8 2H12V8H18V12H12V18H8V12H2V8H8V2Z" 
                                    fill="#60A5FA" 
                                    stroke="white" 
                                    strokeWidth="0.5"
                                  />
                                </svg>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Circuit Patterns */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={`circuit-${i}`}
                              className="absolute"
                              style={{
                                top: `${20 + i * 30}%`,
                                left: `${10}%`,
                                width: '80%',
                                height: '1px',
                                backgroundColor: i % 2 === 0 ? '#8B5CF6' : '#60A5FA',
                                opacity: 0.6,
                              }}
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ 
                                scaleX: [0, 1],
                                opacity: [0, 0.6, 0.3]
                              }}
                              transition={{
                                duration: 1.2,
                                delay: i * 0.2 + 0.3,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                          
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={`node-${i}`}
                              className="absolute w-2 h-2 rounded-full bg-white"
                              style={{
                                top: `${20 + (i % 3) * 30}%`,
                                left: `${20 + i * 20}%`,
                                boxShadow: '0 0 5px rgba(255,255,255,0.8)'
                              }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1, 0.8],
                                opacity: [0, 1, 0.2]
                              }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.15 + 0.5,
                                ease: "backOut",
                              }}
                            />
                          ))}
                        </div>



                        {/* Data Flow Animation */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {[...Array(5)].map((_, i) => (
                            <motion.div 
                              key={`flow-${i}`}
                              className="absolute h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                              style={{
                                top: `${15 + Math.random() * 70}%`,
                                left: 0,
                                width: '100%',
                                opacity: 0.5,
                              }}
                              initial={{ x: '-100%', opacity: 0 }}
                              animate={{ 
                                x: ['100%', '-100%'],
                                opacity: [0, 0.7, 0]
                              }}
                              transition={{
                                x: {
                                  duration: 2 + Math.random(),
                                  repeat: Infinity, 
                                  ease: "linear",
                                  delay: i * 0.4
                                },
                                opacity: {
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: i * 0.4,
                                  repeatType: "mirror"
                                }
                              }}
                            />
                          ))}
                        </div>

                        {/* Pulse Effect on Completion */}
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-primary"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0, 0.1, 0],
                            scale: [0.95, 1.02, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: 3,
                            repeatDelay: 0.5
                          }}
                        />

                        {/* AI Magic Wand Icon with Enhanced Animation */}
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{ 
                            opacity: 1, 
                            scale: [0, 1.2, 1],
                            rotate: [-45, 15, 0]
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "backOut"
                          }}
                        >
                          {/* Updated AI icon with data stream effect */}
                          <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            
                            {/* Radiating pulses */}
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={`pulse-${i}`}
                                className="absolute inset-0 rounded-full border border-primary"
                                initial={{ scale: 0.8, opacity: 0.7 }}
                                animate={{ 
                                  scale: [0.8, 1.8],
                                  opacity: [0.7, 0]
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.4,
                                  ease: "easeOut"
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                  
                  {/* Button now appears below the dropdown with full width */}
                  <button
                    type="button"
                    className={`relative btn w-full mt-2 ${
                      findingMatch 
                        ? 'btn-primary' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white'
                    }`}
                    onClick={findBestMatch}
                    disabled={findingMatch || !formData.description || autoCompletingAssignee}
                    title="Use AI to find the perfect team member for this task"
                  >
                    <div className="absolute inset-0 bg-white rounded-md opacity-0 group-hover:opacity-10"></div>
                    
                    {findingMatch ? (
                      <div className="flex flex-col items-center w-full py-1 overflow-hidden">
                        <div className="relative h-40 w-full">
                          {/* Server/AI Visualization Animation - Increased size */}
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 136" height={120} width={100} className="overflow-visible">
                              {/* Server Structure - Bottom Layer */}
                              <motion.path 
                                stroke="#4B22B5" 
                                strokeWidth="1.5"
                                d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z" 
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                  pathLength: 1, 
                                  opacity: 1,
                                  y: [0, -3, 0],
                                }}
                                transition={{ 
                                  pathLength: { duration: 1.5, ease: "easeInOut" },
                                  opacity: { duration: 1 },
                                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                }}
                              />
                              
                              {/* Server Structure - Middle Layer */}
                              <motion.path 
                                stroke="#5728CC" 
                                strokeWidth="1.5"
                                d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z" 
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                  pathLength: 1, 
                                  opacity: 1,
                                  y: [0, -2, 0],
                                }}
                                transition={{ 
                                  pathLength: { duration: 1.5, delay: 0.3, ease: "easeInOut" },
                                  opacity: { duration: 1, delay: 0.3 },
                                  y: { duration: 3, delay: 0.2, repeat: Infinity, ease: "easeInOut" }
                                }}
                              />
                              
                              {/* Server Box - Top Layer */}
                              <motion.g
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                  opacity: 1, 
                                  y: [0, -4, 0]
                                }}
                                transition={{ 
                                  opacity: { duration: 0.8, delay: 0.6 },
                                  y: { duration: 3, delay: 0.4, repeat: Infinity, ease: "easeInOut" }
                                }}
                              >
                                <path fill="url(#server-gradient)" d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z" />
                                <g mask="url(#mask-server)">
                                  <path fill="#332C94" d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z" />
                                  <rect width="50" height="32" x="22" y="54" fill="#191a56" rx="2"/>
                                  
                                  {/* Enhanced Data Processing Animation */}
                                  <motion.rect 
                                    width="30" 
                                    height="2" 
                                    x="32" 
                                    y="62" 
                                    fill="#80C0D4" 
                                    rx="1"
                                    initial={{ scaleX: 0, opacity: 0.7 }}
                                    animate={{ 
                                      scaleX: [0, 1, 0],
                                      opacity: [0.7, 1, 0.7]
                                    }}
                                    transition={{ 
                                      duration: 2, 
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                      delay: 0.5
                                    }}
                                  />
                                  <motion.rect 
                                    width="40" 
                                    height="2" 
                                    x="27" 
                                    y="68" 
                                    fill="#80C0D4" 
                                    rx="1"
                                    initial={{ scaleX: 0, opacity: 0.7 }}
                                    animate={{ 
                                      scaleX: [0, 1, 0],
                                      opacity: [0.7, 1, 0.7]
                                    }}
                                    transition={{ 
                                      duration: 2.3, 
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                      delay: 0.1
                                    }}
                                  />
                                  <motion.rect 
                                    width="36" 
                                    height="2" 
                                    x="30" 
                                    y="74" 
                                    fill="#80C0D4" 
                                    rx="1"
                                    initial={{ scaleX: 0, opacity: 0.7 }}
                                    animate={{ 
                                      scaleX: [0, 1, 0],
                                      opacity: [0.7, 1, 0.7]
                                    }}
                                    transition={{ 
                                      duration: 1.8, 
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                      delay: 0.8
                                    }}
                                  />
                                </g>
                              </motion.g>
                              
                              {/* Enhanced Floating Particles - More particles and better distribution */}
                              <motion.g>
                                {[...Array(12)].map((_, i) => ( // Increased from 9 to 12 particles
                                  <motion.circle
                                    key={i}
                                    r={i % 3 === 0 ? 2.5 : i % 3 === 1 ? 2 : 1.5}
                                    fill={`url(#particle-gradient-${i % 3})`}
                                    initial={{ 
                                      x: 15 + Math.random() * 60, // Wider distribution 
                                      y: 65 + Math.random() * 40, // Wider distribution
                                      opacity: 0 
                                    }}
                                    animate={{ 
                                      y: [null, 20],
                                      opacity: [0, 1, 0] 
                                    }}
                                    transition={{ 
                                      y: { 
                                        duration: 1.5 + Math.random() * 2, // Faster animation
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeOut",
                                        delay: i * 0.2 // Quicker sequence
                                      },
                                      opacity: { 
                                        duration: 1.5 + Math.random() * 2, 
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut",
                                        times: [0, 0.2, 1],
                                        delay: i * 0.2
                                      },
                                    }}
                                  />
                                ))}
                              </motion.g>
                              
                              {/* Enhanced Scanning Beam */}
                              <motion.rect
                                x="2"
                                y="60"
                                width="90"
                                height="1"
                                fill="#97E6FF"
                                opacity={0.8}
                                initial={{ y: 60 }}
                                animate={{ y: [60, 90, 60] }}
                                transition={{
                                  duration: 3.5, // Faster scan
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                              
                              {/* New Connection Lines */}
                              {[...Array(3)].map((_, i) => (
                                <motion.path
                                  key={i}
                                  stroke={`url(#connection-gradient-${i})`}
                                  strokeWidth="0.5"
                                  strokeDasharray="3,3"
                                  d={`M${25 + i * 20},40 Q${46 + i * 3},${55 + i * 5} ${65 - i * 8},${40 + i * 3}`}
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ 
                                    pathLength: 1,
                                    opacity: [0, 0.7, 0]
                                  }}
                                  transition={{
                                    pathLength: { duration: 2, delay: i * 0.5, repeat: Infinity },
                                    opacity: { 
                                      duration: 3, 
                                      delay: i * 0.5, 
                                      repeat: Infinity,
                                      times: [0, 0.5, 1]
                                    }
                                  }}
                                />
                              ))}
                              
                              {/* Data Pulse Effect - New */}
                              <motion.circle
                                cx="47"
                                cy="55"
                                r="15"
                                fill="url(#pulse-gradient)"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                  opacity: [0, 0.2, 0],
                                  scale: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              
                              {/* Definitions for gradients and masks */}
                              <defs>
                                <linearGradient id="server-gradient" x1="91" y1="43" x2="2" y2="97" gradientUnits="userSpaceOnUse">
                                  <stop stopColor="#4559C4" />
                                  <stop offset="0.29" stopColor="#332C94" />
                                  <stop offset="1" stopColor="#5727CB" />
                                </linearGradient>
                                
                                <linearGradient id="particle-gradient-0" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#5927CE" />
                                  <stop offset="1" stopColor="#91DDFB" />
                                </linearGradient>
                                
                                <linearGradient id="particle-gradient-1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#91DDFB" />
                                  <stop offset="1" stopColor="#5927CE" />
                                </linearGradient>
                                
                                <linearGradient id="particle-gradient-2" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#8841D5" />
                                  <stop offset="1" stopColor="#91DDFB" />
                                </linearGradient>
                                
                                {/* New gradients */}
                                <linearGradient id="pulse-gradient" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#5927CE" stopOpacity="0.8" />
                                  <stop offset="1" stopColor="#91DDFB" stopOpacity="0.3" />
                                </linearGradient>
                                
                                {/* Connection line gradients */}
                                <linearGradient id="connection-gradient-0" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#5927CE" />
                                  <stop offset="1" stopColor="#91DDFB" />
                                </linearGradient>
                                <linearGradient id="connection-gradient-1" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#91DDFB" />
                                  <stop offset="1" stopColor="#5927CE" />
                                </linearGradient>
                                <linearGradient id="connection-gradient-2" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                                  <stop stopColor="#8841D5" />
                                  <stop offset="1" stopColor="#91DDFB" />
                                </linearGradient>
                                
                                <mask id="mask-server">
                                  <rect width="65" height="40" x="14" y="50" fill="white" rx="2"/>
                                </mask>
                              </defs>
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          initial={{ scale: 1, rotate: 0 }}
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0, -5, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut"
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </motion.div>
                        <span>Find Best Match with AI</span>
                      </div>
                    )}
                  </button>
                  
                  {formData.description && !findingMatch && (
                    <label className="label">
                      <span className="label-text-alt flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Use AI to automatically find the best person for this task based on skills
                      </span>
                    </label>
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Deadline</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="input input-bordered w-full"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <div>
                  {task && (
                    <button 
                      type="button"
                      className={`btn ${confirmDelete ? 'btn-error' : 'btn-outline btn-error'}`}
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {confirmDelete ? 'Confirm Delete' : 'Delete Task'}
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskModal;