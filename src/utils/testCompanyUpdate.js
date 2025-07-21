import api from '../services/api';

/**
 * Test utility to diagnose company update issues
 * @param {string} companyId - Company ID
 * @param {Object} companyData - Company data to update
 * @returns {Promise} Promise with test results
 */
export const testCompanyUpdate = async (companyId, companyData) => {
  console.group('Company Update Test');
  
  try {
    console.log('Testing company update with:', {
      companyId,
      companyData
    });
    
    // Test 1: Get current company
    console.log('Test 1: Getting current company...');
    const getCurrentResponse = await api.get('/companies/me');
    console.log('Current company:', getCurrentResponse.data);
    
    // Test 2: Update company with minimal data
    console.log('Test 2: Updating company with minimal data...');
    const minimalData = {
      name: companyData.name,
      description: companyData.description
    };
    const minimalUpdateResponse = await api.put(`/companies/${companyId}`, minimalData);
    console.log('Minimal update response:', minimalUpdateResponse.data);
    
    // Test 3: Update company with full data
    console.log('Test 3: Updating company with full data...');
    const fullUpdateResponse = await api.put(`/companies/${companyId}`, companyData);
    console.log('Full update response:', fullUpdateResponse.data);
    
    console.log('All tests passed successfully!');
    return {
      success: true,
      currentCompany: getCurrentResponse.data,
      minimalUpdate: minimalUpdateResponse.data,
      fullUpdate: fullUpdateResponse.data
    };
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    return {
      success: false,
      error: error.message,
      responseData: error.response?.data,
      status: error.response?.status
    };
  } finally {
    console.groupEnd();
  }
};