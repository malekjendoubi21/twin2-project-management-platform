import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/Api';

const ResourceDetails = () => {
  const { id, projectId, resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      setLoading(true);
      try {
        // Fetch resource details
        const resourceResponse = await api.get(`/api/ressources/${resourceId}`);
        setResource(resourceResponse.data);
        
        // Fetch associated project details
        const projectResponse = await api.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data);
      } catch (error) {
        console.error('Error fetching resource details:', error);
        toast.error('Failed to load resource data');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [resourceId, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
        <p className="mb-6 max-w-md">This resource doesn't exist or you don't have permission to view it.</p>
        <Link to={`/workspace/${id}/projects/${projectId}`} className="btn btn-primary">
          Back to Project
        </Link>
      </div>
    );
  }

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'Matériel': return 'bg-primary text-primary-content';
      case 'Humain': return 'bg-secondary text-secondary-content';
      case 'Financier': return 'bg-accent text-accent-content';
      default: return 'bg-base-300';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link to={`/workspace/${id}/projects`} className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Projects
            </Link>
          </li>
          <li>
            <Link to={`/workspace/${id}/projects/${projectId}`} className="flex items-center gap-1">
              {project?.project_name || 'Project'}
            </Link>
          </li>
          <li>
            <span className="flex items-center gap-1">Resource Details</span>
          </li>
        </ul>
      </div>

      {/* Resource Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 z-0"></div>
          
          <div className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${getResourceTypeColor(resource.resource_type)}`}>
                    {resource.resource_type}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/workspace/${id}/projects/${projectId}`)}
                  className="btn btn-outline gap-2"
                >
                  Back to Project
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="stats bg-base-100 shadow-md border border-base-200">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium text-base-content/90">Estimated Cost</div>
                  <div className="stat-value text-primary">${resource.estimated_cost}</div>
                </div>
              </div>
              
              <div className="stats bg-base-100 shadow-md border border-base-200">
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium text-base-content/90">Estimated Time</div>
                  <div className="stat-value text-secondary">{resource.estimated_time}h</div>
                </div>
              </div>
              
              <div className="stats bg-base-100 shadow-md border border-base-200">
                <div className="stat">
                  <div className="stat-figure text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium text-base-content/90">Team Size</div>
                  <div className="stat-value text-accent">{resource.team_size}</div>
                </div>
              </div>

              <div className="stats bg-base-100 shadow-md border border-base-200">
                <div className="stat">
                  <div className="stat-figure text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                    </svg>
                  </div>
                  <div className="stat-title font-medium text-base-content/90">Resource Utilization</div>
                  <div className="stat-desc text-success text-2xl font-bold">
                    {Math.round((resource.allocated_time / resource.estimated_time) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Allocation Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-primary">Cost Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base-content/70">Estimated Cost</span>
                        <span className="font-bold">${resource.estimated_cost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">Allocated Cost</span>
                        <span className="font-bold text-success">${resource.allocated_cost}</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min((resource.allocated_cost / resource.estimated_cost) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-secondary">Time Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base-content/70">Estimated Time</span>
                        <span className="font-bold">{resource.estimated_time}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base-content/70">Allocated Time</span>
                        <span className="font-bold text-success">{resource.allocated_time}h</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full"
                            style={{ width: `${Math.min((resource.allocated_time / resource.estimated_time) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResourceDetails;