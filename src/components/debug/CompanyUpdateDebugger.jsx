import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { testCompanyUpdate } from '../../utils/testCompanyUpdate';

function CompanyUpdateDebugger() {
  const { company } = useSelector((state) => state.company);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    primary_color: '#3B82F6',
    secondary_color: '#1F2937',
  });

  // Initialize form with company data when available
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        domain: company.domain || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        website: company.website || '',
        primary_color: company.primary_color || '#3B82F6',
        secondary_color: company.secondary_color || '#1F2937',
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTest = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const result = await testCompanyUpdate(company.id, formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          disabled
          title="This feature is currently disabled."
          className="bg-gray-400 text-white px-4 py-2 rounded-md shadow-lg cursor-not-allowed opacity-60"
        >
          Debug Company Update (Disabled)
        </button>
      </div>
    );
  }

  // If somehow visible, show a disabled overlay
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center z-10">
          <span className="text-lg font-semibold text-gray-700">This feature is currently disabled.</span>
        </div>
        {/* The rest of the UI is visually blocked */}
      </div>
    </div>
  );
}

export default CompanyUpdateDebugger;