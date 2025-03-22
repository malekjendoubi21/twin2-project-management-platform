import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useSession from '../../hooks/useSession';
import api from '../../utils/Api';

const CreateWorkspace = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user,refreshUser  } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // 1. Create the workspace
      const workspaceResponse = await api.post('/api/workspaces/addWorkspace', {
        name,
        description,
        owner: user._id
      });
      
      const newWorkspace = workspaceResponse.data;
      
      // 2. Update the user
      await api.patch(`/api/users/${user._id}/add-workspace`, {
        workspaceId: newWorkspace._id
      });
      
      // 3. Force a full refresh of user data
      await refreshUser();
  
      // 4. Show success message
      toast.success('Workspace created successfully!');
      
      // 5. Navigate to the new workspace
      navigate(`/workspace/${newWorkspace._id}`, { replace: true });
      
    } catch (err) {
      console.error("Workspace creation error:", err);
      toast.error(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 font-poppins p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Create New Workspace</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Workspace Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter workspace name"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32"
              placeholder="Describe your workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;