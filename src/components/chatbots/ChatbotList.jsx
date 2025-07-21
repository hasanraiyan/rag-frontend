import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  fetchChatbots, 
  deleteChatbot, 
  setFilters,
  setSelectedChatbot 
} from '../../store/slices/chatbotSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createNotification } from '../../utils/notificationUtils';
import { 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  MessageCircle, 
  ExternalLink, 
  Trash2, 
  Eye, 
  EyeOff, 
  Globe, 
  Lock,
  Calendar,
  Settings,
  BarChart3,
  Zap,
  Copy,
  Share,
  Activity,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

function ChatbotList() {
  const dispatch = useDispatch();
  const { 
    chatbots, 
    isLoading, 
    isDeleting, 
    error, 
    filters 
  } = useSelector((state) => state.chatbots);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'activity'

  useEffect(() => {
    dispatch(fetchChatbots());
  }, [dispatch]);

  // Statistics
  const stats = useMemo(() => {
    const total = chatbots.length;
    const publicCount = chatbots.filter(bot => bot.publicLinkEnabled).length;
    const privateCount = total - publicCount;
    const withIntegration = chatbots.filter(bot => bot.integrationEnabled).length;
    
    return { total, publicCount, privateCount, withIntegration };
  }, [chatbots]);

  // Filter and sort chatbots
  const filteredAndSortedChatbots = useMemo(() => {
    let filtered = chatbots.filter((chatbot) => {
      const matchesSearch = chatbot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           chatbot.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesVisibility = filters.visibility === 'all' || 
                               (filters.visibility === 'public' && chatbot.publicLinkEnabled) ||
                               (filters.visibility === 'private' && !chatbot.publicLinkEnabled);
      
      return matchesSearch && matchesVisibility;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
        case 'oldest':
          return new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [chatbots, filters, sortBy]);

  const handleSearch = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleVisibilityFilter = (visibility) => {
    dispatch(setFilters({ visibility }));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteChatbot(id)).unwrap();
      createNotification(dispatch, { message: 'Chatbot deleted successfully! 🗑️', type: 'success' });
      setDeleteConfirmId(null);
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to delete chatbot', type: 'error' });
    }
  };

  const copyPublicLink = (chatbotId) => {
    const link = `${window.location.origin}/public/chat/${chatbotId}`;
    navigator.clipboard.writeText(link);
    createNotification(dispatch, { message: 'Public link copied to clipboard! 📋', type: 'success' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500">Loading your chatbots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Bot className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load chatbots
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || error}
        </p>
        <Button onClick={() => dispatch(fetchChatbots())} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              Chatbots
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and deploy your AI-powered chatbots
            </p>
          </div>
          <Link to="/dashboard/chatbots/create">
            <Button size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Chatbots
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Public
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.publicCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Private
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.privateCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    With Widget
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.withIntegration}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search chatbots by name or description..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="pl-10 pr-4"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Tabs value={filters.visibility} onValueChange={handleVisibilityFilter}>
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="public" className="text-xs">Public</TabsTrigger>
                    <TabsTrigger value="private" className="text-xs">Private</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    <Bot className="w-4 h-4 mr-2" />
                    Name A-Z
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {filteredAndSortedChatbots.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedChatbots.length} of {chatbots.length} chatbots
            </p>
          </div>
        )}

        {/* Chatbot Grid */}
        {filteredAndSortedChatbots.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Bot className="w-10 h-10 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {filters.search || filters.visibility !== 'all' 
                      ? 'No chatbots match your filters'
                      : 'No chatbots yet'
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    {filters.search || filters.visibility !== 'all' 
                      ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                      : 'Create your first AI chatbot to get started with automated conversations.'
                    }
                  </p>
                </div>

                {!filters.search && filters.visibility === 'all' ? (
                  <Link to="/dashboard/chatbots/create">
                    <Button size="lg" className="shadow-lg">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Your First Chatbot
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      dispatch(setFilters({ search: '', visibility: 'all' }));
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedChatbots.map((chatbot) => (
              <Card key={chatbot.id || chatbot._id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-lg truncate">
                          {chatbot.name}
                        </CardTitle>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge 
                          variant={chatbot.publicLinkEnabled ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {chatbot.publicLinkEnabled ? (
                            <>
                              <Globe className="w-3 h-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Private
                            </>
                          )}
                        </Badge>
                        
                        {chatbot.integrationEnabled && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Widget
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/chatbots/${chatbot.id || chatbot._id}/edit`} className="flex items-center">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/chatbots/${chatbot.id || chatbot._id}/chat`} className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Test Chat
                          </Link>
                        </DropdownMenuItem>
                        
                        {chatbot.publicLinkEnabled && (
                          <>
                            <DropdownMenuItem onClick={() => copyPublicLink(chatbot.id || chatbot._id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Public Link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/public/chat/${chatbot.id || chatbot._id}`} target="_blank" className="flex items-center">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Public Page
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteConfirmId(chatbot.id || chatbot._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                    {chatbot.description || 'No description provided'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        {chatbot.modelName || chatbot.model_name || 'gemma-3-27b-it'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          const dateStr = chatbot.createdAt || chatbot.created_at;
                          if (!dateStr) return 'N/A';
                          const d = new Date(dateStr);
                          return isNaN(d) ? 'N/A' : d.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={`/dashboard/chatbots/${chatbot.id || chatbot._id}/chat`}>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Test
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Test this chatbot</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/dashboard/chatbots/${chatbot.id || chatbot._id}/edit`}>
                            <Settings className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit settings</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {chatbot.publicLinkEnabled && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyPublicLink(chatbot.id || chatbot._id)}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy public link</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Chatbot
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Are you sure you want to delete this chatbot? This action cannot be undone.</p>
                <p className="text-sm text-gray-500">
                  All associated conversations, configurations, and integrations will be permanently removed.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chatbot
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default ChatbotList;