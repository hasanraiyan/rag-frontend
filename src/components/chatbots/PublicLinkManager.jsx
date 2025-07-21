import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  generatePublicLink,
  togglePublicLink,
  fetchChatbots
} from '../../store/slices/chatbotSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createNotification } from '../../utils/notificationUtils';

function PublicLinkManager({ chatbot }) {
  const dispatch = useDispatch();
  const { publicLinks, isLoading } = useSelector((state) => state.chatbots);
  const { theme } = useSelector((state) => state.ui);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the public link ID from either the chatbot object or the publicLinks state
  const publicLinkId = chatbot?.publicLinkId || (chatbot?.id && publicLinks[chatbot.id]);

  // Construct the public URL if we have a link ID
  const publicUrl = publicLinkId ? `${window.location.origin}/chat/${publicLinkId}` : '';

  // Check if public link is enabled
  const isEnabled = chatbot?.publicLinkEnabled || false;

  useEffect(() => {
    // Fetch public link data if chatbot has public link enabled but no link ID
    if (chatbot?.publicLinkEnabled && !publicLinkId) {
      handleGenerateLink();
    }
  }, [chatbot?.id, chatbot?.publicLinkEnabled, publicLinkId]);

  const handleGenerateLink = async () => {
    if (!chatbot?.id) return;

    try {
      setIsGenerating(true);
      await dispatch(generatePublicLink(chatbot.id)).unwrap();
      createNotification(dispatch, { message: 'Public link generated successfully', type: 'success' });
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to generate public link', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleLink = async (enabled) => {
    if (!chatbot?.id) return;

    try {
      setIsToggling(true);
      await dispatch(togglePublicLink({
        chatbotId: chatbot.id,
        enabled
      })).unwrap();

      // No need for additional logic here as togglePublicLink now handles
      // both enabling (by generating a link) and disabling

      createNotification(dispatch, { message: 'Public link updated successfully', type: 'success' });
    } catch (error) {
      createNotification(dispatch, { message: error.message || 'Failed to update public link', type: 'error' });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      createNotification(dispatch, { message: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      createNotification(dispatch, { message: 'Failed to copy link', type: 'error' });
    }
  };

  const handleOpenLink = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  if (!chatbot) {
    return (
      <div className="text-center py-8">
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          No chatbot selected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Public Link Management
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Share your chatbot with anyone using a public link. No account required for users.
        </p>
      </div>

      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Public Access</span>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-link-toggle">Enable Public Link</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Allow anonymous users to access this chatbot via a public URL
              </p>
            </div>
            <Switch
              id="public-link-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggleLink}
              disabled={isToggling}
            />
          </div>

          {isEnabled && (
            <>
              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="public-url">Public URL</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="public-url"
                      value={publicUrl}
                      readOnly
                      placeholder={isGenerating ? 'Generating...' : 'No link generated'}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      disabled={!publicUrl || isGenerating}
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleOpenLink}
                      disabled={!publicUrl || isGenerating}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </Button>
                  </div>
                </div>

                {!publicUrl && !isGenerating && (
                  <Button
                    onClick={handleGenerateLink}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Generate Public Link
                      </>
                    )}
                  </Button>
                )}

                {isGenerating && (
                  <div className="flex justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isEnabled && publicUrl && (
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle>Link Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Chatbot Name</Label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {chatbot.name}
                </p>
              </div>
              <div>
                <Label>Created</Label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {chatbot.createdAt
                    ? new Date(chatbot.createdAt).toLocaleDateString()
                    : 'Just now'
                  }
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant="default" className="mt-1">
                  Active
                </Badge>
              </div>
              <div>
                <Label>Access</Label>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Anonymous users
                </p>
              </div>
            </div>

            <Separator />

            <Alert>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <AlertDescription>
                <strong>Security Note:</strong> Anyone with this link can access your chatbot.
                Make sure your chatbot doesn't contain sensitive information or enable features
                that could be misused by anonymous users.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {!isEnabled && (
        <Alert>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <AlertDescription>
            Public link is currently disabled. Enable it to allow anonymous users to access this chatbot.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default PublicLinkManager;