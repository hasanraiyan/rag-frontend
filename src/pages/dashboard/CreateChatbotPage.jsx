import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ChatbotForm from '../../components/chatbots/ChatbotForm';
import { Button } from '../../components/ui/button';

function CreateChatbotPage() {
  const { theme } = useSelector((state) => state.ui);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Create New Chatbot
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure your AI chatbot with custom settings and branding
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

      {/* Form */}
      <div className="max-w-4xl">
        <ChatbotForm />
      </div>
    </div>
  );
}

export default CreateChatbotPage;