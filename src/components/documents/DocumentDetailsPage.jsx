import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocumentById } from '../../store/slices/documentSlice';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d) ? 'N/A' : d.toLocaleString();
}

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedDocument: document, isLoading } = useSelector(state => state.documents);
  const { theme } = useSelector(state => state.ui);

  useEffect(() => {
    if (id) dispatch(fetchDocumentById(id));
  }, [id, dispatch]);

  if (isLoading || !document || document._id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <span className="text-lg font-semibold mb-4 text-gray-700 dark:text-white">Loading document details...</span>
        <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Back to List</button>
      <h1 className="text-2xl font-bold mb-4">Document Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">ID:</span> {document._id}</div>
          <div><span className="font-medium">Filename:</span> {document.filename}</div>
          <div><span className="font-medium">Original Filename:</span> {document.original_filename || 'N/A'}</div>
          <div><span className="font-medium">Title:</span> {document.title || 'N/A'}</div>
          <div><span className="font-medium">Status:</span> {document.status}</div>
          <div><span className="font-medium">File Type:</span> {document.file_type || 'N/A'}</div>
          <div><span className="font-medium">MIME Type:</span> {document.mime_type || 'N/A'}</div>
          <div><span className="font-medium">Size:</span> {formatFileSize(document.file_size)}</div>
          <div><span className="font-medium">Uploaded:</span> {formatDate(document.created_at)}</div>
          <div><span className="font-medium">Updated At:</span> {formatDate(document.updated_at)}</div>
          <div><span className="font-medium">Uploaded By:</span> {document.uploaded_by || 'N/A'}</div>
          <div><span className="font-medium">Company ID:</span> {document.company_id || 'N/A'}</div>
          <div><span className="font-medium">Chunk Count:</span> {document.chunk_count ?? 'N/A'}</div>
          <div><span className="font-medium">Processing Started:</span> {formatDate(document.processing_started_at)}</div>
          <div><span className="font-medium">Processing Completed:</span> {formatDate(document.processing_completed_at)}</div>
          <div><span className="font-medium">File Path:</span> <span className="break-all">{document.file_path || 'N/A'}</span></div>
          <div><span className="font-medium">Parent Document ID:</span> {document.parent_document_id || 'N/A'}</div>
          <div><span className="font-medium">Version:</span> {document.version ?? 'N/A'}</div>
          <div><span className="font-medium">Tags:</span> {document.tags && document.tags.length > 0 ? document.tags.join(', ') : 'N/A'}</div>
          <div><span className="font-medium">Vector IDs:</span> {document.vector_ids && document.vector_ids.length > 0 ? document.vector_ids.join(', ') : 'N/A'}</div>
          {document.description && <div><span className="font-medium">Description:</span> {document.description}</div>}
          {document.processing_error && <div className="text-red-600 dark:text-red-400"><span className="font-medium">Error:</span> {document.processing_error}</div>}
        </div>
        <div>
          {document.file_type === 'pdf' ? (
            <div className="flex items-center justify-center h-[600px] w-full border rounded shadow bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-lg font-semibold">
              PDF view of document coming soon
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">No preview available for this file type.</div>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Chunks</h2>
        {document.chunks && document.chunks.length > 0 ? (
          <div className="space-y-4">
            {document.chunks.map((chunk, idx) => (
              <div key={idx} className="p-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="mb-2 text-xs text-gray-500">Chunk #{chunk.chunk_index}</div>
                <pre className="whitespace-pre-wrap break-words text-sm mb-2">{chunk.content}</pre>
                {chunk.metadata && <div className="text-xs text-gray-400">Metadata: {JSON.stringify(chunk.metadata)}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No chunks available.</div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailsPage; 