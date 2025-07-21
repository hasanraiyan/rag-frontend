import React from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';

function CompanyStats() {
  const { company } = useSelector((state) => state.company);
  const { theme } = useSelector((state) => state.ui);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Format storage size to human-readable format
  const formatStorage = (sizeInMB) => {
    if (sizeInMB < 1000) {
      return `${sizeInMB.toFixed(1)} MB`;
    } else {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
  };

  // Calculate storage usage percentage
  const calculateStoragePercentage = () => {
    if (!company?.stats?.storage_used_mb || !company?.max_storage_gb) {
      return 0;
    }
    
    const maxStorageMB = company.max_storage_gb * 1024;
    return Math.min(100, Math.round((company.stats.storage_used_mb / maxStorageMB) * 100));
  };

  const stats = [
    {
      name: 'Team Members',
      value: company?.stats?.user_count || 0,
      limit: company?.max_users || 0,
      icon: (
        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Documents',
      value: company?.stats?.document_count || 0,
      limit: company?.max_documents || 0,
      icon: (
        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Chatbots',
      value: company?.stats?.chatbot_count || 0,
      limit: 'Unlimited',
      icon: (
        <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      name: 'Chat Sessions',
      value: company?.stats?.session_count || 0,
      limit: 'Unlimited',
      icon: (
        <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Company Statistics</h2>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-50 dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {stat.value} {stat.limit && <span className="text-sm text-gray-500 dark:text-gray-400">/ {stat.limit}</span>}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Storage Usage */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Usage</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {company?.stats?.storage_used_mb ? formatStorage(company.stats.storage_used_mb) : '0 MB'} 
              {company?.max_storage_gb ? ` / ${company.max_storage_gb} GB` : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${calculateStoragePercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Plan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company?.subscription_plan ? company.subscription_plan.charAt(0).toUpperCase() + company.subscription_plan.slice(1) : 'Free'} Plan
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowUpgradeModal(true)}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="mb-6">Upgrade plans will be available soon. Stay tuned!</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowUpgradeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CompanyStats;