import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatbots, fetchChatbot } from '../../store/slices/chatbotSlice';
import ChatbotForm from '../../components/chatbots/ChatbotForm';
import DocumentAssignment from '../../components/chatbots/DocumentAssignment';
import PublicLinkManager from '../../components/chatbots/PublicLinkManager';
import WidgetIntegration from '../../components/chatbots/WidgetIntegration';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function EditChatbotPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { chatbots, isLoading } = useSelector((state) => state.chatbots);
  const { theme } = useSelector((state) => state.ui);
  
  const [chatbot, setChatbot] = useState(null);

  useEffect(() => {
    if (id) {
      // First try to find the chatbot in the existing list
      const foundChatbot = chatbots.find(bot => bot.id === id);
      if (foundChatbot) {
        setChatbot(foundChatbot);
      } else {
        // If not found, fetch it specifically
        dispatch(fetchChatbot(id));
      }
    }
  }, [dispatch, id, chatbots]);

  const { selectedChatbot } = useSelector((state) => state.chatbots);
  
  useEffect(() => {
    // Update chatbot when selectedChatbot changes (from fetchChatbot)
    if (selectedChatbot && selectedChatbot.id === id) {
      setChatbot(selectedChatbot);
    }
  }, [selectedChatbot, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <svg
          className={`mx-auto h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
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
        <h3 className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
          Chatbot not found
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Edit Chatbot: {chatbot.name}
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your chatbot configuration, documents, and integrations
          </p>
        </div>
        <Link to="/dashboard/chatbots">
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chatbots
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="public-link">Public Link</TabsTrigger>
          <TabsTrigger value="widget">Widget</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="max-w-4xl">
            <ChatbotForm 
              chatbot={chatbot} 
              onSuccess={() => {
                // Refresh chatbot data after update
                dispatch(fetchChatbots());
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentAssignment chatbotId={chatbot.id} />
        </TabsContent>

        <TabsContent value="public-link" className="space-y-6">
          <PublicLinkManager chatbot={chatbot} />
        </TabsContent>

        <TabsContent value="widget" className="space-y-6">
          <WidgetIntegration chatbot={chatbot} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EditChatbotPage;