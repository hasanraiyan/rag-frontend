import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchChatbotDocuments, 
  assignDocument, 
  unassignDocument 
} from '../../store/slices/chatbotSlice';
import { fetchDocuments } from '../../store/slices/documentSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createNotification } from '../../utils/notificationUtils';
import {
  FileText,
  Search,
  Plus,
  Minus,
  Download,
  Upload,
  Database,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle,
  AlertCircle,
  Files,
  Brain,
  Zap,
  Archive,
  Filter,
  Grid,
  List,
  Copy,
  Eye,
  Settings,
  Layers,
  Target
} from 'lucide-react';

function DocumentAssignment({ chatbotId }) {
  const dispatch = useDispatch();
  const { assignedDocuments } = useSelector((state) => state.chatbots);
  const { documents } = useSelector((state) => state.documents);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDocument, setDraggedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState({ available: false, assigned: false });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all'); // 'all', 'pdf', 'doc', 'txt'

  const chatbotDocuments = assignedDocuments[chatbotId] || [];

  // Helper functions - moved to top to avoid initialization issues
  const getDocumentProperty = (document, propertyNames) => {
    for (const name of propertyNames) {
      if (document[name] !== undefined) {
        return document[name];
      }
    }
    return null;
  };

  const getDocumentId = (document) => {
    return document.id || document._id;
  };

  const isDocumentAssigned = (document) => {
    const docId = getDocumentId(document);
    return chatbotDocuments.some(assigned => 
      getDocumentId(assigned) === docId
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('txt')) return '📃';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  useEffect(() => {
    if (chatbotId) {
      dispatch(fetchChatbotDocuments(chatbotId));
      dispatch(fetchDocuments());
    }
  }, [dispatch, chatbotId]);

  // Statistics
  const stats = useMemo(() => {
    const totalDocuments = documents.length;
    const availableCount = documents.filter(doc => 
      getDocumentProperty(doc, ['status']) === 'completed' && 
      !isDocumentAssigned(doc)
    ).length;
    const assignedCount = chatbotDocuments.length;
    const totalChunks = chatbotDocuments.reduce((sum, doc) => 
      sum + (getDocumentProperty(doc, ['chunkCount', 'chunk_count']) || 0), 0
    );
    const totalSize = chatbotDocuments.reduce((sum, doc) => 
      sum + (getDocumentProperty(doc, ['fileSize', 'file_size']) || 0), 0
    );

    return {
      totalDocuments,
      availableCount,
      assignedCount,
      totalChunks,
      totalSize,
      assignmentProgress: totalDocuments > 0 ? Math.round((assignedCount / totalDocuments) * 100) : 0
    };
  }, [documents, chatbotDocuments]);

  // Filter available documents
  const availableDocuments = useMemo(() => {
    return documents.filter(doc => {
      const isAssigned = isDocumentAssigned(doc);
      const status = getDocumentProperty(doc, ['status']);
      const isCompleted = status === 'completed';
      
      const filename = getDocumentProperty(doc, ['filename']);
      const originalFilename = getDocumentProperty(doc, ['originalFilename', 'original_filename']);
      const fileType = getDocumentProperty(doc, ['fileType', 'file_type']) || '';
      
      const matchesSearch = searchTerm === '' || 
        (filename && filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (originalFilename && originalFilename.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || 
        fileType.toLowerCase().includes(filterType.toLowerCase());
      
      return !isAssigned && isCompleted && matchesSearch && matchesFilter;
    });
  }, [documents, chatbotDocuments, searchTerm, filterType]);

  const handleDragStart = (e, document) => {
    setDraggedDocument(document);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, area) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(prev => ({ ...prev, [area]: true }));
  };

  const handleDragLeave = (e, area) => {
    e.preventDefault();
    setIsDragOver(prev => ({ ...prev, [area]: false }));
  };

  const handleDrop = async (e, isAssignedArea = false) => {
    e.preventDefault();
    setIsDragOver({ available: false, assigned: false });
    
    if (!draggedDocument) return;

    try {
      setIsLoading(true);
      
      const documentId = getDocumentId(draggedDocument);
      const docIsAssigned = isDocumentAssigned(draggedDocument);
      
      if (isAssignedArea && !docIsAssigned) {
        await dispatch(assignDocument({ chatbotId, documentId })).unwrap();
        await dispatch(fetchChatbotDocuments(chatbotId)).unwrap();
        
        createNotification(dispatch, {
          message: 'Document assigned successfully! 📎',
          type: 'success'
        });
      } else if (!isAssignedArea && docIsAssigned) {
        await dispatch(unassignDocument({ chatbotId, documentId })).unwrap();
        await dispatch(fetchChatbotDocuments(chatbotId)).unwrap();
        
        createNotification(dispatch, {
          message: 'Document unassigned successfully! 📤',
          type: 'success'
        });
      }
    } catch (error) {
      createNotification(dispatch, {
        message: error.message || 'Failed to update document assignment',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setDraggedDocument(null);
    }
  };

  const handleAssignClick = async (document) => {
    try {
      setIsLoading(true);
      const documentId = getDocumentId(document);
      
      await dispatch(assignDocument({ chatbotId, documentId })).unwrap();
      await dispatch(fetchChatbotDocuments(chatbotId)).unwrap();
      
      createNotification(dispatch, {
        message: 'Document assigned successfully! 📎',
        type: 'success'
      });
    } catch (error) {
      createNotification(dispatch, {
        message: error.message || 'Failed to assign document',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignClick = async (document) => {
    try {
      setIsLoading(true);
      const documentId = getDocumentId(document);
      
      await dispatch(unassignDocument({ chatbotId, documentId })).unwrap();
      await dispatch(fetchChatbotDocuments(chatbotId)).unwrap();
      
      createNotification(dispatch, {
        message: 'Document unassigned successfully! 📤',
        type: 'success'
      });
    } catch (error) {
      createNotification(dispatch, {
        message: error.message || 'Failed to unassign document',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocumentCard = (document, isAssigned = false) => {
    const fileType = getDocumentProperty(document, ['fileType', 'file_type']) || 'DOC';
    const fileSize = getDocumentProperty(document, ['fileSize', 'file_size']) || 0;
    const chunkCount = getDocumentProperty(document, ['chunkCount', 'chunk_count']) || 0;
    const originalFilename = getDocumentProperty(document, ['originalFilename', 'original_filename', 'filename']);
    const createdAt = getDocumentProperty(document, ['createdAt', 'created_at']);

    return (
      <div
        key={getDocumentId(document)}
        draggable
        onDragStart={(e) => handleDragStart(e, document)}
        className={`group relative p-4 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md ${
          isAssigned
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
              isAssigned 
                ? 'bg-blue-100 dark:bg-blue-800' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {getFileIcon(fileType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {originalFilename}
                  </h4>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{originalFilename}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {fileType.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileSize)}
                </span>
                {chunkCount > 0 && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {chunkCount}
                  </span>
                )}
              </div>
              
              {createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Added {new Date(createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAssigned ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnassignClick(document)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove from chatbot</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignClick(document)}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assign to chatbot</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-600" />
                Knowledge Base
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage documents that power your chatbot's knowledge
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {stats.assignmentProgress}% Configured
            </Badge>
          </div>
          
          <Progress value={stats.assignmentProgress} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.availableCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Archive className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Assigned
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.assignedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Chunks
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalChunks.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Size
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Files className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Documents</option>
                  <option value="txt">Text</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Assignment Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-green-600" />
                  Available Documents
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {availableDocuments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`min-h-80 max-h-96 overflow-y-auto space-y-3 p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isDragOver.available
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                }`}
                onDragOver={(e) => handleDragOver(e, 'available')}
                onDragLeave={(e) => handleDragLeave(e, 'available')}
                onDrop={(e) => handleDrop(e, false)}
              >
                {availableDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Archive className="w-12 h-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm || filterType !== 'all' ? 'No matches found' : 'No available documents'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                      {searchTerm || filterType !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Upload and process documents to make them available for assignment.'
                      }
                    </p>
                  </div>
                ) : (
                  availableDocuments.map((document) => renderDocumentCard(document, false))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Assigned Documents
                </span>
                <Badge variant="default" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {chatbotDocuments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className={`min-h-80 max-h-96 overflow-y-auto space-y-3 p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isDragOver.assigned
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                }`}
                onDragOver={(e) => handleDragOver(e, 'assigned')}
                onDragLeave={(e) => handleDragLeave(e, 'assigned')}
                onDrop={(e) => handleDrop(e, true)}
              >
                {chatbotDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Upload className="w-12 h-12 text-blue-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No documents assigned
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300 max-w-sm">
                      Drag documents from the available section or click the assign button to give your chatbot knowledge.
                    </p>
                  </div>
                ) : (
                  chatbotDocuments.map((document) => renderDocumentCard(document, true))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Updating document assignments...
              </span>
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card>
          <CardContent className="p-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-medium">How Document Assignment Works:</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside ml-4">
                    <li>Only successfully processed documents can be assigned to chatbots</li>
                    <li>Drag documents between sections or use the assign/remove buttons</li>
                    <li>Assigned documents provide knowledge that the chatbot can reference in conversations</li>
                    <li>More documents generally improve the chatbot's ability to answer specific questions</li>
                    <li>Use the search and filter options to quickly find specific documents</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default DocumentAssignment;