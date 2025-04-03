import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../utils/Api';
import useSession from '../../hooks/useSession';
import { hasPermission, getUserRole } from '../../utils/permissionUtils';

const WorkspaceMembers = () => {
  const { workspace, refreshWorkspace } = useOutletContext() || {};
  const { user } = useSession();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  useEffect(() => {
    if (workspace) {
      fetchMembers();
    }
  }, [workspace]);
  
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Get detailed member information including workspace roles
      const response = await api.get(`/api/workspaces/${workspace._id}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load workspace members');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRoleChange = async (memberId, newRole) => {
    if (!hasPermission('edit', workspace, user._id)) {
      toast.error('You do not have permission to change member roles');
      return;
    }
    
    try {
      setUpdating(memberId);
      await api.put(`/api/workspaces/${workspace._id}/members/${memberId}`, {
        role: newRole
      });
      
      toast.success('Member role updated successfully');
      // Refresh the member list
      fetchMembers();
      // Also refresh the workspace to update all UI components
      refreshWorkspace();
      
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    } finally {
      setUpdating(null);
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    if (!hasPermission('edit', workspace, user._id)) {
      toast.error('You do not have permission to remove members');
      return;
    }
    
    if (!window.confirm('Are you sure you want to remove this member from the workspace?')) {
      return;
    }
    
    try {
      setUpdating(memberId);
      await api.delete(`/api/workspaces/${workspace._id}/members/${memberId}`);
      
      toast.success('Member removed successfully');
      // Refresh the member list
      fetchMembers();
      // Also refresh the workspace
      refreshWorkspace();
      
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setUpdating(null);
    }
  };
  
  // Get current user's role in this workspace
  const currentUserRole = getUserRole(workspace, user?._id);
  const canManageRoles = currentUserRole === 'owner' || currentUserRole === 'admin';
  
  return (
    <div className="space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Workspace Members</h1>
      </div>
      
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    {canManageRoles && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                          <div className="w-10 rounded-full">
                            {member.profile_picture ? 
                              <img src={member.profile_picture} alt="Profile"/>
                              :
                <span className="bg-primary text-white flex items-center justify-center h-full">
                  {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || '?'}
                  </span>}
                  </div>
                          </div>
                          <div>
                            <div className="font-bold">{member.name}</div>
                            {workspace.owner === member._id && (
                              <div className="text-xs opacity-50">Workspace Owner</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{member.email}</td>
                      <td>
                        {workspace.owner === member._id ? (
                          <span className="badge badge-primary">Owner</span>
                        ) : canManageRoles ? (
                          <select 
                            className="select select-bordered select-sm w-full max-w-xs"
                            value={member.role || 'viewer'}
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                            disabled={updating === member._id || member._id === user?._id}
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="badge">{member.role || 'viewer'}</span>
                        )}
                      </td>
                      {canManageRoles && (
                        <td>
                          {workspace.owner !== member._id && member._id !== user?._id && (
                            <button 
                              className="btn btn-sm btn-error"
                              onClick={() => handleRemoveMember(member._id)}
                              disabled={updating === member._id}
                            >
                              {updating === member._id ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : 'Remove'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Member Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Viewer</h3>
              <p className="opacity-70">Can view projects and tasks, but cannot make changes.</p>
            </div>
            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Editor</h3>
              <p className="opacity-70">Can create and edit projects, tasks, and invite new members.</p>
            </div>
            <div className="border border-base-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Admin</h3>
              <p className="opacity-70">Full access to manage the workspace, except deletion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembers;