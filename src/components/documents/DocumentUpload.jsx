import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument } from '../../store/slices/documentSlice';
import { addNotification } from '../../store/slices/uiSlice';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt'];

function DocumentUpload() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { uploadProgress } = useSelector((state) => state.documents);
  
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  // Validate file
  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      dispatch(addNotification({
        type: 'error',
        message: `File ${file.name} is too large. Maximum size is 10MB.`
      }));
      return false;
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      // Check extension as fallback
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
        dispatch(addNotification({
          type: 'error',
          message: `File ${file.name} has an unsupported format. Allowed formats: PDF, DOCX, TXT.`
        }));
        return false;
      }
    }
    
    return true;
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };
  
  // Process files
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(validateFile);
    
    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
  };
  
  // Remove file from list
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please select files to upload.'
      }));
      return;
    }
    
    // Upload each file
    for (const file of files) {
      try {
        await dispatch(uploadDocument({ file })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: `${file.name} uploaded successfully.`
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`
        }));
      }
    }
    
    // Clear file list after upload
    setFiles([]);
  };
  
  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Upload Documents
      </h2>
      
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? theme === 'dark'
              ? 'border-blue-500 bg-blue-900 bg-opacity-10'
              : 'border-blue-500 bg-blue-50'
            : theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
        />
        
        <svg
          className={`mx-auto h-12 w-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <div className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="text-sm font-medium">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs mt-1">
            Supported formats: PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Selected Files ({files.length})
          </h3>
          <ul className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                
                {/* Progress bar or remove button */}
                {uploadProgress[file.name] ? (
                  <div className="w-24">
                    <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1">
                      {uploadProgress[file.name]}%
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className={`text-sm font-medium ${
                      theme === 'dark'
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-500'
                    }`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Upload button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={uploadFiles}
          disabled={files.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
            files.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          Upload {files.length > 0 ? `(${files.length})` : ''}
        </button>
      </div>
    </div>
  );
}

export default DocumentUpload;