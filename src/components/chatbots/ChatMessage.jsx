import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  Info, 
  Eye, 
  EyeOff,
  MessageSquare,
  Zap,
  Hash,
  Calendar
} from 'lucide-react';
import 'highlight.js/styles/github-dark.css'; // Adjust theme as needed

function ChatMessage({ message, isTyping = false }) {
  const { theme } = useSelector((state) => state.ui);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Handle different API response formats
  const isUserMessage = message.is_user_message !== undefined ? 
                       message.is_user_message : 
                       (message.role === 'user');
                       
  const createdAt = message.created_at || message.createdAt || new Date().toISOString();
  const formattedTime = new Date(createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  // Get content from different possible API formats
  const content = message.content || message.text || '';
  
  // Copy message content
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Custom markdown components for compact styling
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }) => {
      
      if (!inline) {
        return (
          <div className="relative group my-1">
            <pre className={`${className} rounded-md p-2 text-sm overflow-x-auto bg-gray-900 dark:bg-gray-800`}>
              <code {...props} className={className}>
                {children}
              </code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1"
              onClick={() => navigator.clipboard.writeText(String(children))}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        );
      }
      
      return (
        <code 
          className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm font-mono" 
          {...props}
        >
          {children}
        </code>
      );
    },
    
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-2 py-1 my-1 bg-blue-50 dark:bg-blue-900/20 italic text-sm">
        {children}
      </blockquote>
    ),
    
    table: ({ children }) => (
      <div className="overflow-x-auto my-1 text-sm">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-md">
          {children}
        </table>
      </div>
    ),
    
    th: ({ children }) => (
      <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700 font-semibold text-left text-xs">
        {children}
      </th>
    ),
    
    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs">
        {children}
      </td>
    ),
    
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {children}
      </a>
    ),
    
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-0.5 my-1 ml-4 text-sm">
        {children}
      </ul>
    ),
    
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-0.5 my-1 ml-4 text-sm">
        {children}
      </ol>
    ),
    
    h1: ({ children }) => <h1 className="text-lg font-bold mt-2 mb-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold mt-1.5 mb-0.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold mt-1 mb-0.5">{children}</h3>,
    p: ({ children }) => <p className="my-1">{children}</p>,
  };

  // Compact Typing Indicator
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 py-1">
      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className={`flex items-start gap-2 mb-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
        {/* Avatar */}
        {!isUserMessage && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white mt-1">
            <Bot className="w-4 h-4" />
          </div>
        )}
        
        <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isUserMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender Info */}
          <div className={`flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {isUserMessage ? 'You' : 'Assistant'}
            </span>
            <span>{formattedTime}</span>
          </div>

          {/* Message Bubble */}
          <div 
            className={`group relative px-4 py-2 rounded-2xl transition-all duration-200 hover:shadow-sm ${
              isUserMessage 
                ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none'
            }`}
          >
            <div className="text-sm">
              {isTyping ? (
                <TypingIndicator />
              ) : (
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content}
                </ReactMarkdown>
              )}
            </div>

            {/* Actions Bar - Compact and on hover */}
            {!isTyping && (
              <div className={`flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs ${
                isUserMessage ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
              }`}>
                <div className="flex items-center space-x-1">
                  {/* Copy */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyMessage}
                        className={`h-5 w-5 p-0 ${
                          isUserMessage 
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500/30' 
                            : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{copied ? 'Copied!' : 'Copy message'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Details */}
                  {!isUserMessage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowDetails(!showDetails)}
                          className={`h-5 w-5 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{showDetails ? 'Hide details' : 'Show details'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Char count */}
                {content.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {content.length} chars
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Details Panel - Compact version */}
          {!isUserMessage && showDetails && !isTyping && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs border border-gray-200 dark:border-gray-600">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                  <Info className="w-3 h-3" />
                  Details
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {message.id && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <code className="truncate">{message.id}</code>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-gray-400" />
                    {content.split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                  {message.response_time && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      {message.response_time}ms
                    </div>
                  )}
                </div>

                {message.metadata && Object.keys(message.metadata).length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-sm font-medium mb-1">Metadata</div>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(message.metadata, null, 2)}
                    </pre>
                  </>
                )}

                {message.sources && message.sources.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-sm font-medium mb-1">Sources ({message.sources.length})</div>
                    <div className="space-y-2 max-h-40 overflow-auto">
                      {message.sources.map((source, index) => (
                        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                          <div className="font-medium text-xs truncate">
                            {source.title || source.filename || `Source ${index + 1}`}
                          </div>
                          {source.content && (
                            <p className="text-xs mt-1 line-clamp-2">
                              {source.content}
                            </p>
                          )}
                          {source.confidence && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {Math.round(source.confidence * 100)}% match
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {isUserMessage && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 text-white mt-1">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default ChatMessage;