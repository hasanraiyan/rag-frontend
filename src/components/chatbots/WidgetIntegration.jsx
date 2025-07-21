import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { createNotification } from '../../utils/notificationUtils';

function WidgetIntegration({ chatbot }) {
  const { theme } = useSelector((state) => state.ui);
  const [copied, setCopied] = useState(false);
  const [widgetCode, setWidgetCode] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [reactCode, setReactCode] = useState('');

  useEffect(() => {
    if (chatbot && chatbot.integrationEnabled) {
      generateIntegrationCode();
    }
  }, [chatbot]);

  const generateIntegrationCode = () => {
    if (!chatbot) return;

    const baseUrl = window.location.origin;
    const widgetUrl = `${baseUrl}/widget.js`;
    
    // JavaScript Widget Code
    const jsCode = `<!-- AI Chatbot Widget -->
<script>
(function(w,d,s,o,f,js,fjs){
  w['ChatbotWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
  js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
  js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
}(window,document,'script','chatbot','${widgetUrl}'));

chatbot('init', {
  chatbotId: '${chatbot.id}',
  position: '${chatbot.branding?.widgetPosition || 'bottom-right'}',
  primaryColor: '${chatbot.branding?.widgetColor || '#007bff'}',
  title: '${chatbot.branding?.widgetTitle || 'Chat with us'}',
  welcomeMessage: '${chatbot.branding?.welcomeMessage || 'How can I help you today?'}'
});
</script>`;

    // HTML Integration
    const htmlIntegration = `<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->
    
    ${jsCode}
</body>
</html>`;

    // React Integration
    const reactIntegration = `import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load chatbot widget
    const script = document.createElement('script');
    script.src = '${widgetUrl}';
    script.async = true;
    script.onload = () => {
      window.chatbot('init', {
        chatbotId: '${chatbot.id}',
        position: '${chatbot.branding?.widgetPosition || 'bottom-right'}',
        primaryColor: '${chatbot.branding?.widgetColor || '#007bff'}',
        title: '${chatbot.branding?.widgetTitle || 'Chat with us'}',
        welcomeMessage: '${chatbot.branding?.welcomeMessage || 'How can I help you today?'}'
      });
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (window.chatbot) {
        window.chatbot('destroy');
      }
    };
  }, []);

  return (
    <div>
      {/* Your React app content */}
    </div>
  );
}

export default App;`;

    setWidgetCode(jsCode);
    setHtmlCode(htmlIntegration);
    setReactCode(reactIntegration);
  };

  const handleCopyCode = async (code, type) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(type);
      createNotification(dispatch, { message: `${type} code copied to clipboard`, type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      createNotification(dispatch, { message: 'Failed to copy code', type: 'error' });
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

  if (!chatbot.integrationEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Widget Integration
          </h3>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Embed your chatbot as a widget on any website
          </p>
        </div>

        <Alert>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <AlertDescription>
            Widget integration is currently disabled for this chatbot. 
            Enable it in the chatbot settings to get the integration code.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Widget Integration
        </h3>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Copy and paste the code below to embed your chatbot on any website
        </p>
      </div>

      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Widget Status</span>
            <Badge variant="default">Enabled</Badge>
          </CardTitle>
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
              <Label>Widget Position</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {chatbot.branding?.widgetPosition || 'bottom-right'}
              </p>
            </div>
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: chatbot.branding?.widgetColor || '#007bff' }}
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {chatbot.branding?.widgetColor || '#007bff'}
                </span>
              </div>
            </div>
            <div>
              <Label>Widget Title</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {chatbot.branding?.widgetTitle || 'Chat with us'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle>Integration Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>JavaScript Widget Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(widgetCode, 'JavaScript')}
                  >
                    {copied === 'JavaScript' ? (
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
                </div>
                <Textarea
                  value={widgetCode}
                  readOnly
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Add this code before the closing &lt;/body&gt; tag of your website
                </p>
              </div>
            </TabsContent>

            <TabsContent value="html" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Complete HTML Example</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(htmlCode, 'HTML')}
                  >
                    {copied === 'HTML' ? (
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
                </div>
                <Textarea
                  value={htmlCode}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete HTML page example with the widget integrated
                </p>
              </div>
            </TabsContent>

            <TabsContent value="react" className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>React Component Integration</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(reactCode, 'React')}
                  >
                    {copied === 'React' ? (
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
                </div>
                <Textarea
                  value={reactCode}
                  readOnly
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  React component example with proper cleanup
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <AlertDescription>
          <strong>Integration Tips:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
            <li>The widget will appear as a floating button on your website</li>
            <li>Users can click it to open the chat interface</li>
            <li>The widget respects your branding settings (color, position, title)</li>
            <li>Make sure your website allows external scripts if you have CSP policies</li>
            <li>Test the integration on a staging environment first</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default WidgetIntegration;