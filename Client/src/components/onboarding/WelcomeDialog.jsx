import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/Api';
import { toast } from 'react-hot-toast';
import { FaFileUpload, FaTimes, FaCheck } from 'react-icons/fa';
import useSession from '../../hooks/useSession';

const WelcomeDialog = () => {
  const [showDialog, setShowDialog] = useState(false); // Start with false instead of true
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, refreshUser, isAuthenticated } = useSession();

  // Only show the dialog when user is properly loaded
  useEffect(() => {
    if (!user || !isAuthenticated) return;
    
    // Check if user has seen welcome dialog
    const hasSeenWelcome = localStorage.getItem(`${user._id}_has_seen_welcome`);
    
    if (!hasSeenWelcome) {
      setShowDialog(true);
    }
  }, [user, isAuthenticated]);

  // If user isn't loaded yet, don't render anything
  if (!user) {
    return null;
  }

  const handleSkip = () => {
    if (!user || !user._id) return;
    localStorage.setItem(`${user._id}_has_seen_welcome`, 'true');
    setShowDialog(false);
  };

  const handleUploadCV = () => {
    setShowDialog(false);
    setShowUploadDialog(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (
      selectedFile.type === 'application/pdf' ||
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      selectedFile.type === 'application/msword'
    )) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid PDF or Word document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user || !user._id) {
      toast.error('Please select a file to upload or try again later');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await api.post('/api/users/parse-cv', formData, {
        timeout: 60000,  // Increase from 10000 to 60000 (1 minute)
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        toast.success('CV uploaded and processed successfully!');
        // Refresh user data to reflect extracted info
        await refreshUser();
        localStorage.setItem(`${user._id}_has_seen_welcome`, 'true');
        setShowUploadDialog(false);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Error processing your CV. Please try again later.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      {/* Welcome Dialog */}
      <AnimatePresence>
        {showDialog && user && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-base-100 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mt-4">Welcome{user.name ? `, ${user.name}` : ''}!</h2>
                <p className="text-base-content/70 mt-2">
                  We're excited to have you on board. Would you like to set up your profile quickly by uploading your CV?
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleUploadCV}
                  className="btn btn-primary w-full gap-2"
                >
                  <FaFileUpload /> Upload my CV
                </button>
                <button
                  onClick={handleSkip}
                  className="btn btn-ghost w-full"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload CV Dialog */}
      <AnimatePresence>
        {showUploadDialog && user && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-base-100 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Your CV</h2>
                <button 
                  onClick={() => {
                    setShowUploadDialog(false);
                    if (user && user._id) {
                      localStorage.setItem(`${user._id}_has_seen_welcome`, 'true');
                    }
                  }}
                  className="btn btn-sm btn-circle"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-base-content/70 mb-4">
                We'll extract your skills, experience, and other information automatically to enhance your profile.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FaCheck className="text-green-500" />
                      <span className="font-medium text-green-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="btn btn-xs btn-circle ml-2"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaFileUpload className="mx-auto h-12 w-12 text-base-content/50" />
                      <p className="mt-2">Drag and drop your CV here, or click to select a file</p>
                      <p className="text-xs text-base-content/50 mt-1">Supported formats: PDF, DOC, DOCX</p>
                    </>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className={`absolute inset-0 opacity-0 cursor-pointer ${file ? 'pointer-events-none' : ''}`}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                </div>

                {uploading && (
                  <div className="w-full bg-base-300 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-center mt-1">{uploadProgress}% Uploaded</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadDialog(false);
                      if (user && user._id) {
                        localStorage.setItem(`${user._id}_has_seen_welcome`, 'true');
                      }
                    }}
                    className="btn btn-ghost"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!file || uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Processing...
                      </>
                    ) : (
                      'Upload & Process'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WelcomeDialog;