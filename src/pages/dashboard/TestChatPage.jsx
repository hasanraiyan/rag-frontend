import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatbot } from '../../store/slices/chatbotSlice';
import { resetChatState } from '../../store/slices/chatSlice';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import ChatInterface from '../../components/chatbots/ChatInterface';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  Maximize, 
  Minimize, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';

function TestChatPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { chatbots, isLoading, error } = useSelector((state) => state.chatbots);
  const { theme } = useSelector((state) => state.ui);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatContainerRef = useRef(null);
  
  // Find the chatbot by ID
  const chatbot = chatbots.find(bot => bot.id === id);

  // Fetch chatbot if not found in state
  useEffect(() => {
    if (id && !chatbot) {
      dispatch(fetchChatbot(id));
    }
  }, [dispatch, id, chatbot]);

  // Reset chat state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetChatState());
    };
  }, [dispatch]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const element = chatContainerRef.current;
    if (!document.fullscreenElement) {
      const requestMethod = element.requestFullscreen ||
                            element.mozRequestFullScreen ||
                            element.webkitRequestFullscreen ||
                            element.msRequestFullscreen;
      if (requestMethod) {
        requestMethod.call(element).catch(err => console.error('Fullscreen error:', err));
      }
    } else {
      const exitMethod = document.exitFullscreen ||
                         document.mozCancelFullScreen ||
                         document.webkitExitFullscreen ||
                         document.msExitFullscreen;
      if (exitMethod) {
        exitMethod.call(document).catch(err => console.error('Exit fullscreen error:', err));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg
          className={`mx-auto h-12 w-12 text-red-500`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className={`mt-2 text-lg font-medium text-gray-900 dark:text-white`}>
          Error loading chatbot
        </h3>
        <p className={`mt-1 text-sm text-gray-500`}>
          {error.message || 'Failed to load chatbot details'}
        </p>
        <div className="mt-6">
          <Link to="/dashboard/chatbots">
            <Button>
              Back to Chatbots
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <svg
          className={`mx-auto h-12 w-12 text-gray-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className={`mt-2 text-sm font-medium text-gray-900 dark:text-white`}>
          Chatbot not found
        </h3>
        <p className={`mt-1 text-sm text-gray-500`}>
          The chatbot you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link to="/dashboard/chatbots">
            <Button>
              Back to Chatbots
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div 
        ref={chatContainerRef}
        className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden' : 'space-y-6'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isFullscreen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
          <div className="flex items-center gap-4">
            <Link to={`/dashboard/chatbots/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Chat: {chatbot.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Interact with your chatbot in real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/dashboard/chatbots/${id}/edit`}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 mr-2" />
                  ) : (
                    <Maximize className="w-4 h-4 mr-2" />
                  )}
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle fullscreen mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Chat Interface - Take full height */}
        <div className={`${isFullscreen ? 'flex-1 overflow-hidden' : 'h-[calc(100vh-200px)]'}`}>
          <ChatInterface chatbot={chatbot} />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default TestChatPage;