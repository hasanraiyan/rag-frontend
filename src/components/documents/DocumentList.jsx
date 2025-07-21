import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments, setSelectedDocument, updateFilters, fetchDocumentById, downloadDocument, deleteDocument, fetchProcessingStats, fetchDocumentStatus } from '../../store/slices/documentSlice';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';

function DocumentDetailsModal({ document, onClose, theme }) {
  if (!document) return null;

  // Map API fields to expected frontend fields for modal
  const mappedDoc = {
    ...document,
    id: document.id || document._id,
    fileSize: document.fileSize ?? document.file_size,
    createdAt: document.createdAt ?? document.created_at,
    originalFilename: document.original_filename,
    fileType: document.file_type,
    mimeType: document.mime_type,
    chunkCount: document.chunk_count,
    processingStartedAt: document.processing_started_at,
    processingCompletedAt: document.processing_completed_at,
    uploadedBy: document.uploaded_by,
    filePath: document.file_path,
    title: document.title,
    status: document.status,
    description: document.description,
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d) ? 'N/A' : d.toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative`} 
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Document Details</h2>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Filename:</span> {mappedDoc.filename}</div>
          <div><span className="font-medium">Original Filename:</span> {mappedDoc.originalFilename || 'N/A'}</div>
          <div><span className="font-medium">Title:</span> {mappedDoc.title || 'N/A'}</div>
          <div><span className="font-medium">Status:</span> {mappedDoc.status}</div>
          <div><span className="font-medium">File Type:</span> {mappedDoc.fileType || 'N/A'}</div>
          <div><span className="font-medium">MIME Type:</span> {mappedDoc.mimeType || 'N/A'}</div>
          <div><span className="font-medium">Size:</span> {formatFileSize(mappedDoc.fileSize)}</div>
          <div><span className="font-medium">Uploaded:</span> {formatDate(mappedDoc.createdAt)}</div>
          <div><span className="font-medium">Uploaded By:</span> {mappedDoc.uploadedBy || 'N/A'}</div>
          <div><span className="font-medium">Chunk Count:</span> {mappedDoc.chunkCount ?? 'N/A'}</div>
          <div><span className="font-medium">Processing Started:</span> {formatDate(mappedDoc.processingStartedAt)}</div>
          <div><span className="font-medium">Processing Completed:</span> {formatDate(mappedDoc.processingCompletedAt)}</div>
          <div><span className="font-medium">File Path:</span> <span className="break-all">{mappedDoc.filePath || 'N/A'}</span></div>
          {mappedDoc.description && <div><span className="font-medium">Description:</span> {mappedDoc.description}</div>}
          {mappedDoc.processing_error && <div className="text-red-600 dark:text-red-400"><span className="font-medium">Error:</span> {mappedDoc.processing_error}</div>}
        </div>
      </div>
    </div>
  );
}

function DocumentList() {
  const dispatch = useDispatch();
  const { documents, filters, isLoading, processingStats, processingSummary } = useSelector((state) => state.documents);
  const { theme } = useSelector((state) => state.ui);
  const [searchInput, setSearchInput] = useState(filters.search);
  const initialLoad = React.useRef(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedDocument = useSelector((state) => state.documents.selectedDocument);
  
  // Fetch documents on component mount
  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);
  
  // Fetch summary stats on mount and every 10s
  useEffect(() => {
    dispatch(fetchProcessingStats());
    const interval = setInterval(() => {
      dispatch(fetchProcessingStats());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Poll per-document status for non-completed docs
  useEffect(() => {
    const unfinished = documents.filter(doc => doc.status !== 'completed');
    if (unfinished.length === 0) return;
    unfinished.forEach(doc => {
      dispatch(fetchDocumentStatus(doc.id || doc._id));
    });
    const interval = setInterval(() => {
      unfinished.forEach(doc => {
        dispatch(fetchDocumentStatus(doc.id || doc._id));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [documents, dispatch]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  
  // Apply search filter
  const handleSearch = () => {
    dispatch(updateFilters({ search: searchInput }));
  };
  
  // Handle search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    dispatch(updateFilters({ status: e.target.value }));
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    dispatch(updateFilters({ sortBy, sortOrder }));
  };
  
  // Handle document selection
  const handleSelectDocument = (document) => {
    setDetailsOpen(true);
    dispatch(fetchDocumentById(document.id));
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(setSelectedDocument(null));
  };
  
  // Merge live status from processingStats
  const mappedDocuments = documents.map(doc => {
    const id = doc.id || doc._id;
    const liveStatus = processingStats && processingStats[id];
    return {
      ...doc,
      id,
      fileSize: doc.fileSize ?? doc.file_size,
      createdAt: doc.createdAt ?? doc.created_at,
      liveStatus: liveStatus,
      status: liveStatus?.status || doc.status,
    };
  });

  // Filter and sort documents
  const filteredDocuments = mappedDocuments.filter((doc) => {
    // Apply search filter
    if (filters.search && !doc.filename.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (filters.status !== 'all' && doc.status !== filters.status) {
      return false;
    }
    
    return true;
  });
  
  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const sortBy = filters.sortBy;
    const sortOrder = filters.sortOrder;
    
    if (sortBy === 'createdAt') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    if (sortBy === 'filename') {
      return sortOrder === 'asc'
        ? a.filename.localeCompare(b.filename)
        : b.filename.localeCompare(a.filename);
    }
    
    if (sortBy === 'fileSize') {
      return sortOrder === 'asc'
        ? a.fileSize - b.fileSize
        : b.fileSize - a.fileSize;
    }
    
    return 0;
  });
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'completed':
        return theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'failed':
        return theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      default:
        return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Download document
  const handleDownload = (documentId) => {
    dispatch({ type: 'documents/downloadDocument/pending' });
    dispatch(downloadDocument(documentId));
  };

  // Delete document
  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      dispatch(deleteDocument(documentId));
    }
  };

  useEffect(() => {
    if (isLoading && initialLoad.current) {
      initialLoad.current = true;
    } else if (!isLoading && initialLoad.current) {
      initialLoad.current = false;
    }
  }, [isLoading]);

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      {/* Summary bar */}
      {processingSummary && (
        <div className="mb-4 p-4 rounded bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 flex flex-wrap gap-4 text-sm font-medium">
          <span>Documents: {processingSummary.total_documents}</span>
          <span>Completed: {processingSummary.status_counts.completed}</span>
          <span>Processing: {processingSummary.status_counts.processing}</span>
          <span>Pending: {processingSummary.status_counts.pending}</span>
          <span>Failed: {processingSummary.status_counts.failed}</span>
          <span>Deleted: {processingSummary.status_counts.deleted}</span>
          <span>Storage: {processingSummary.total_storage_mb} MB</span>
          <span>Chunks: {processingSummary.total_chunks}</span>
          <span>Vectors: {processingSummary.total_vectors}</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by filename..."
            className={`px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            onClick={handleSearch}
            className="ml-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            Search
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className={`px-2 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={handleSortChange}
            className={`px-2 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
          >
            <option value="createdAt-desc">Newest</option>
            <option value="createdAt-asc">Oldest</option>
            <option value="filename-asc">Filename A-Z</option>
            <option value="filename-desc">Filename Z-A</option>
            <option value="fileSize-asc">Size Asc</option>
            <option value="fileSize-desc">Size Desc</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Filename</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Size</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Uploaded</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialLoad.current && isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={5}><Skeleton className="h-8 w-full my-2" /></td>
                </tr>
              ))
            ) : sortedDocuments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">No documents found.</td>
              </tr>
            ) : (
              sortedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-2 cursor-pointer">
                    <a
                      href={`/dashboard/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {doc.filename}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(doc.status)}`}>
                      {doc.status}
                      {((doc.status === 'processing' || doc.status === 'pending') && doc.liveStatus) && (
                        <span className="ml-2 animate-spin inline-block align-middle">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        </span>
                      )}
                      {doc.liveStatus && doc.liveStatus.message && (
                        <span className="ml-2 text-gray-500">{doc.liveStatus.message}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-2">{new Date(doc.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                      title="Download"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {detailsOpen && (
        isLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative flex flex-col items-center">
              <span className="text-lg font-semibold mb-4 text-gray-700 dark:text-white">Loading document details...</span>
              <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin"></div>
            </div>
          </div>
        ) : (
          <DocumentDetailsModal document={selectedDocument} onClose={handleCloseDetails} theme={theme} />
        )
      )}
    </div>
  );
}

export default DocumentList;