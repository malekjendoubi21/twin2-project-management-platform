import { useState, useEffect } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/Api';

// Projects.jsx
const Projects = () => {
  const { workspace, setWorkspace } = useOutletContext();
  const { id } = useParams();
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);


  // Use workspace projects if available, otherwise fetch separately
  const projects = workspace?.projects || [];
  useEffect(() => {
    const fetchProjects = async () => {
      if (!workspace?.projects) {
        setIsFetching(true);
        try {
          const response = await api.get(`/api/workspaces/${id}/projects`);
          setWorkspace(prev => ({ ...prev, projects: response.data }));
        } catch (err) {
          toast.error('Failed to load projects');
        } finally {
          setIsFetching(false);
        }
      }
    };
  
    fetchProjects();
  }, [id, workspace?.projects, setWorkspace]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post(`/api/workspaces/${id}/projects`, newProject);
      
      // Update both local state and workspace context
      setWorkspace(prev => ({
        ...prev,
        projects: [...prev.projects, response.data]
      }));
      
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully!');
      
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };
  if (isFetching) return <div className="text-center p-8">Loading projects...</div>;
  return (
    <div className="space-y-8">
      {/* Create Project Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="form-control">
              <input
                type="text"
                placeholder="Project Name"
                className="input input-bordered"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                required
              />
            </div>
            <div className="form-control">
              <textarea
                placeholder="Project Description"
                className="textarea textarea-bordered h-24"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h3 className="card-title text-primary">{project.name}</h3>
              <p className="text-base-content">{project.description}</p>
              <div className="card-actions justify-end mt-4">
                <Link 
                  to={`/workspace/${id}/projects/${project._id}`}
                  className="btn btn-primary btn-sm"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-base-content opacity-75">
              No projects created yet. Start by creating your first project!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;