import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentCompany, fetchTeamMembers, fetchInvitations, clearSuccessMessage } from '../../store/slices/companySlice';
import { addNotification } from '../../store/slices/uiSlice';
import CompanyProfileForm from '../../components/company/CompanyProfileForm';
import CompanyStats from '../../components/company/CompanyStats';
import TeamMembersList from '../../components/company/TeamMembersList';
import InvitationForm from '../../components/company/InvitationForm';
import InvitationsList from '../../components/company/InvitationsList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import CompanyUpdateDebugger from '../../components/debug/CompanyUpdateDebugger';

function CompanyPage() {
  const dispatch = useDispatch();
  const { company, isLoading, error, successMessage } = useSelector((state) => state.company);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch company data on component mount
  useEffect(() => {
    dispatch(fetchCurrentCompany());
  }, [dispatch]);

  // Fetch team members and invitations when company data is available
  useEffect(() => {
    if (company?.id) {
      dispatch(fetchTeamMembers(company.id));
      dispatch(fetchInvitations({ companyId: company.id }));
    }
  }, [dispatch, company?.id]);

  // Show success notifications
  useEffect(() => {
    if (successMessage) {
      dispatch(addNotification({
        title: 'Success',
        message: successMessage,
        type: 'success',
      }));
      dispatch(clearSuccessMessage());
    }
  }, [dispatch, successMessage]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        title: 'Error',
        message: error.message || 'An error occurred',
        type: 'error',
      }));
    }
  }, [dispatch, error]);

  // Check if user has admin permissions
  const isAdmin = user?.role === 'admin';

  if (isLoading && !company) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Company Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your company settings, team members, and invitations
            </p>
          </div>
        </div>

        {/* Company Stats */}
        <div className="mb-6">
          <CompanyStats />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Company Profile
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`${activeTab === 'team'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Team Members
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('invitations')}
                className={`${activeTab === 'invitations'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Invitations
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <CompanyProfileForm />
          )}

          {activeTab === 'team' && (
            <TeamMembersList />
          )}

          {activeTab === 'invitations' && isAdmin && (
            <>
              <InvitationForm />
              <InvitationsList />
            </>
          )}
        </div>
      </div>

      {/* Debug component - only visible in development */}
      {/* {process.env.NODE_ENV !== 'production' && <CompanyUpdateDebugger />} */}
    </div>
  );
}

export default CompanyPage;