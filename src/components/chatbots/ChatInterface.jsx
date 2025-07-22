import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createChatThread, 
  fetchChatThreads, 
  sendChatMessage, 
  fetchChatMessages,
  setActiveThread,
  deleteChatThread,
  renameChatThread
} from '../../store/slices/chatSlice';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { TooltipProvider } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import ChatMessage from './ChatMessage';
import { createNotification } from '../../utils/notificationUtils';
import {
  MessageCircle,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Send,
  Clock,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Settings
} from 'lucide-react';

function ChatInterface({ chatbot }) {
  const dispatch = useDispatch();
  const { threads, messages, activeThread, isLoading, isSending } = useSelector((state) => state.chat);
  const { assignedDocuments, isLoading: isChatbotLoading } = useSelector((state) => state.chatbots);
  
  const [inputMessage, setInputMessage] = useState('');
  const [deleteThreadId, setDeleteThreadId] = useState(null);
  const [renameThreadId, setRenameThreadId] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [threadSearch, setThreadSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  
  const messagesEndRef = useRef(null);
  const chatbotId = chatbot?.id;
  const chatThreads = chatbotId ? threads[chatbotId] || [] : [];
  const activeMessages = activeThread ? messages[activeThread.thread_id] || [] : [];
  
  // Check if chatbot has documents assigned
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const chatbotDocuments = chatbotId ? assignedDocuments[chatbotId] : undefined;
  const hasDocuments = chatbotDocuments ? chatbotDocuments.length > 0 : false;
  
  // Track when documents are loaded
  useEffect(() => {
    if (chatbotId && assignedDocuments[chatbotId] !== undefined) {
      setDocumentsLoaded(true);
    }
  }, [chatbotId, assignedDocuments]);

  // Fetch threads when component mounts
  useEffect(() => {
    if (chatbotId) {
      dispatch(fetchChatThreads(chatbotId));
    }
  }, [dispatch, chatbotId]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (chatbotId && activeThread) {
      dispatch(fetchChatMessages({ 
        chatbotId, 
        threadId: activeThread.thread_id 
      }));
    }
  }, [dispatch, chatbotId, activeThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isSending]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  const handleCreateThread = async () => {
    try {
      await dispatch(createChatThread(chatbotId)).unwrap();
      createNotification(dispatch, { message: 'New chat thread created! 💬', type: 'success' });
    } catch (error) {
      createNotification(dispatch, { 
        message: error.message || 'Failed to create chat thread', 
        type: 'error' 
      });
    }
  };

  const handleSelectThread = (thread) => {
    dispatch(setActiveThread(thread));
  };

  const handleDeleteThread = async () => {
    if (!deleteThreadId) return;
    
    try {
      await dispatch(deleteChatThread({ 
        chatbotId, 
        threadId: deleteThreadId 
      })).unwrap();
      
      setDeleteThreadId(null);
      createNotification(dispatch, { message: 'Chat thread deleted successfully! 🗑️', type: 'success' });
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to delete chat thread', type: 'error' });
    }
  };
  
  const handleRenameThread = async () => {
    if (!renameThreadId || !newThreadTitle.trim()) return;
    
    try {
      await dispatch(renameChatThread({ 
        chatbotId, 
        threadId: renameThreadId,
        title: newThreadTitle.trim()
      })).unwrap();
      
      setRenameThreadId(null);
      setNewThreadTitle('');
      createNotification(dispatch, { message: 'Chat thread renamed successfully! ✏️', type: 'success' });
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to rename chat thread', type: 'error' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeThread) return;
    
    try {
      await dispatch(sendChatMessage({
        chatbotId,
        threadId: activeThread.thread_id,
        content: inputMessage.trim()
      })).unwrap();
      
      setInputMessage('');
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to send message', type: 'error' });
    }
  };

  // Filtered threads
  const filteredThreads = chatThreads.filter(thread => 
    thread.thread_title.toLowerCase().includes(threadSearch.toLowerCase())
  );

  if (!chatbot) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <Bot className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No chatbot selected
          </p>
        </div>
      </Card>
    );
  }

  // Show loading state while checking documents
  if (!documentsLoaded && !isChatbotLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading chatbot documents...
          </p>
        </div>
      </Card>
    );
  }

  // Show disabled state if no documents are assigned after loading
  if (documentsLoaded && !hasDocuments) {
    return (
      <TooltipProvider>
        <Card className="h-full flex items-center justify-center">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="relative">
              <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Knowledge Base Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Your chatbot needs at least one document to provide intelligent responses. 
                Add documents to give {chatbot.name} the knowledge it needs to help users.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                    What you can add:
                  </h4>
                  <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                    <li>• PDF documents</li>
                    <li>• Word documents</li>
                    <li>• Text files</li>
                    <li>• Knowledge base articles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = `/dashboard/chatbots/${chatbotId}/documents`}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Add Documents
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/dashboard/chatbots/${chatbotId}/edit`}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure Bot
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Once you add documents, your chatbot will be ready to chat!
            </p>
          </div>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-[500px] gap-2 sm:gap-4">
        {/* Collapsible Sidebar */}
        <Card className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-80 sm:w-72 md:w-80'} flex flex-col overflow-hidden`}>
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base">Chat Threads</CardTitle>
                {!hasDocuments && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full" title="No documents assigned" />
                )}
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-2">
              {!isSidebarCollapsed && (
                <Button size="sm" onClick={handleCreateThread} disabled={isLoading || !hasDocuments}>
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          
          {!isSidebarCollapsed && (
            <>
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search threads..." 
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Archive className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500">No threads found</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <div
                      key={thread.thread_id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        activeThread?.thread_id === thread.thread_id
                          ? 'bg-blue-100 dark:bg-blue-900/50'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSelectThread(thread)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{thread.thread_title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(thread.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setRenameThreadId(thread.thread_id);
                            setNewThreadTitle(thread.thread_title);
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteThreadId(thread.thread_id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              <CardHeader className="border-b p-3 sm:p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base truncate">{activeThread.thread_title}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {activeMessages.length} messages
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{new Date(activeThread.last_message_at).toLocaleDateString()}</span>
                  <span className="sm:hidden">{new Date(activeThread.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </Badge>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 transition-colors duration-300" style={{ minHeight: 300 }}>
                {activeMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                    <h3 className="text-lg sm:text-xl font-semibold">Start the conversation</h3>
                    <p className="text-gray-500 max-w-md text-sm sm:text-base px-4">
                      Ask {chatbot.name} anything! Type your message below to begin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((message, index) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message}
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <Separator />
              
              <CardFooter className="p-3 sm:p-4">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={hasDocuments ? `Message ${chatbot.name}...` : "Add documents to enable chat..."}
                    disabled={isSending || !hasDocuments}
                    className="flex-1 text-sm sm:text-base"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSending || !inputMessage.trim() || !hasDocuments}
                    className="min-w-[80px] sm:min-w-[100px]"
                    size="sm"
                  >
                    {isSending ? (
                      <LoadingSpinner size="sm" className="mr-1 sm:mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-6 min-h-[300px]">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
              <h3 className="text-xl sm:text-2xl font-bold">Ready to chat?</h3>
              <p className="text-gray-500 max-w-md text-sm sm:text-base px-4">
                {!hasDocuments 
                  ? `Add documents to ${chatbot.name} before you can start chatting.`
                  : isSidebarCollapsed 
                    ? 'Click the arrow to open the sidebar and create a new chat to start conversing.'
                    : 'Select a thread from the sidebar or create a new one to start conversing with ' + chatbot.name + '.'
                }
              </p>
              <Button onClick={handleCreateThread} disabled={isLoading || !hasDocuments}>
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          )}
        </Card>

        {/* Dialogs */}
        <AlertDialog open={!!deleteThreadId} onOpenChange={() => setDeleteThreadId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Thread
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All messages will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteThread} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!renameThreadId} onOpenChange={() => setRenameThreadId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Rename Thread
              </AlertDialogTitle>
              <AlertDialogDescription>
                Give this thread a new name.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="Enter thread name"
              className="my-4"
              autoFocus
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRenameThread}
                disabled={!newThreadTitle.trim()}
              >
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default ChatInterface;