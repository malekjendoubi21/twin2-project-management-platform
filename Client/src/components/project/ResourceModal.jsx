import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ResourceModal = ({ 
  isOpen, 
  onClose, 
  resource, 
  projectId, 
  onCreateResource, 
  onUpdateResource, 
  onDeleteResource, 
  modalRef 
}) => {
  const [formData, setFormData] = useState({
    project_id: projectId,
    resource_type: 'Matériel',
    estimated_cost: '',
    estimated_time: '',
    team_size: '',
    allocated_cost: '',
    allocated_time: ''
  });
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        project_id: projectId,
        resource_type: resource.resource_type,
        estimated_cost: resource.estimated_cost,
        estimated_time: resource.estimated_time,
        team_size: resource.team_size,
        allocated_cost: resource.allocated_cost,
        allocated_time: resource.allocated_time
      });
    }
  }, [resource, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (resource) {
        await onUpdateResource(resource._id, formData);
      } else {
        await onCreateResource(formData);
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setLoading(true);
    try {
      await onDeleteResource(resource._id);
      onClose();
    } catch (error) {
      toast.error('Failed to delete resource');
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClickOutside}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-base-100 rounded-xl shadow-2xl max-w-xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              {/* Header accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-t-xl"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">
                    {resource ? 'Edit Resource' : 'Create New Resource'}
                  </h2>
                  <button 
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={onClose}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Resource Type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Resource Type</span>
                    </label>
                    <select
                      name="resource_type"
                      className="select select-bordered w-full"
                      value={formData.resource_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Matériel">Material</option>
                      <option value="Humain">Human</option>
                      <option value="Financier">Financial</option>
                    </select>
                  </div>

                  {/* Costs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Estimated Cost</span>
                      </label>
                      <input
                        type="number"
                        name="estimated_cost"
                        className="input input-bordered w-full"
                        value={formData.estimated_cost}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Allocated Cost</span>
                      </label>
                      <input
                        type="number"
                        name="allocated_cost"
                        className="input input-bordered w-full"
                        value={formData.allocated_cost}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Estimated Time (hours)</span>
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
                        <span className="label-text">Allocated Time (hours)</span>
                      </label>
                      <input
                        type="number"
                        name="allocated_time"
                        min="0"
                        step="0.5"
                        className="input input-bordered w-full"
                        value={formData.allocated_time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Team Size</span>
                    </label>
                    <input
                      type="number"
                      name="team_size"
                      min="0"
                      className="input input-bordered w-full"
                      value={formData.team_size}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-6">
                    <div>
                      {resource && (
                        <button 
                          type="button"
                          className={`btn ${confirmDelete ? 'btn-error' : 'btn-outline btn-error'}`}
                          onClick={handleDelete}
                          disabled={loading}
                        >
                          {confirmDelete ? 'Confirm Delete' : 'Delete Resource'}
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
                        {loading ? 'Saving...' : (resource ? 'Update Resource' : 'Create Resource')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResourceModal;