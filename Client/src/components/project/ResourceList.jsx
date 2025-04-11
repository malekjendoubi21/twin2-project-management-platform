import { motion } from 'framer-motion';

const ResourceList = ({ resources, onEditResource, onUpdateResource }) => {
  // Function to determine badge color based on resource type
  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'Matériel': return 'bg-primary text-primary-content';
      case 'Humain': return 'bg-secondary text-secondary-content';
      case 'Financier': return 'bg-accent text-accent-content';
      default: return 'bg-base-300';
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1d24] rounded-lg overflow-hidden shadow-lg border border-gray-800 p-8"
      >
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No Resources Found</h3>
          <p className="text-gray-400">No resources have been added to this project yet.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <motion.div
          key={resource._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1d24] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-800"
        >
          {/* Header with badge and edit button */}
          <div className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="card-title">
                  <span className={`badge ${getResourceTypeColor(resource.resource_type)}`}>
                    {resource.resource_type}
                  </span>
                </h3>
              </div>
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => onEditResource(resource)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            <div className="text-gray-400 mt-1">
              Estimated Cost: ${resource.estimated_cost}
            </div>
            <div className="text-gray-400 mt-1">
              Estimated Time: {resource.estimated_time}h
            </div>
            
            {/* Footer with avatar and time */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-2 flex items-center text-gray-400">
                    <span className="font-medium">{resource.team_size}</span>
                    <span className="ml-1">members</span>
                  </div>
                </div>

                {/* Time indicator */}
                <div className="flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{resource.estimated_time} hours</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ResourceList;