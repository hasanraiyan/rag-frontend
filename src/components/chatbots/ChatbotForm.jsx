import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createChatbot, updateChatbot } from '../../store/slices/chatbotSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Progress } from '../ui/progress';
import { createNotification } from '../../utils/notificationUtils';
import { 
  Bot, 
  Settings, 
  Palette, 
  Globe, 
  HelpCircle, 
  Eye, 
  Code2, 
  MessageCircle, 
  Zap,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';

const WIDGET_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
  { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
  { value: 'top-right', label: 'Top Right', icon: '↗️' },
  { value: 'top-left', label: 'Top Left', icon: '↖️' },
];

const MODEL_OPTIONS = [
  {
    value: 'gemma-3-27b-it',
    label: 'Gemma 3 27B',
    description: 'Balanced performance and efficiency',
    recommended: true
  }
];

const TEMPERATURE_PRESETS = [
  { value: 0.1, label: 'Focused', description: 'Consistent, factual responses' },
  { value: 0.7, label: 'Balanced', description: 'Good mix of creativity and consistency' },
  { value: 1.2, label: 'Creative', description: 'More varied and creative responses' },
];

function ChatbotForm({ chatbot = null, onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating, isUpdating, error } = useSelector((state) => state.chatbots);
  const { theme } = useSelector((state) => state.ui);
  
  const isEditing = Boolean(chatbot);
  const isLoading = isCreating || isUpdating;

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelName: 'gemma-3-27b-it',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
    visibility: 'private',
    publicLinkEnabled: false,
    integrationEnabled: false,
    branding: {
      widgetColor: '#007bff',
      widgetPosition: 'bottom-right',
      widgetTitle: 'Chat with us',
      welcomeMessage: 'How can I help you today?',
    },
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form completion progress
  const completionProgress = useMemo(() => {
    const requiredFields = ['name'];
    const optionalFields = ['description', 'systemPrompt'];
    const allFields = [...requiredFields, ...optionalFields];
    
    const completedFields = allFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return formData[parent]?.[child]?.trim();
      }
      return formData[field]?.trim();
    });
    
    return Math.round((completedFields.length / allFields.length) * 100);
  }, [formData]);

  // Tab completion status
  const tabCompletionStatus = useMemo(() => {
    return {
      basic: formData.name.trim() ? 'complete' : 'incomplete',
      model: formData.systemPrompt.trim() ? 'complete' : 'partial',
      branding: formData.branding.widgetTitle.trim() && formData.branding.welcomeMessage.trim() ? 'complete' : 'partial',
      integration: 'complete'
    };
  }, [formData]);

  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name || '',
        description: chatbot.description || '',
        modelName: 'gemma-3-27b-it',
        systemPrompt: chatbot.systemPrompt || '',
        temperature: chatbot.temperature || 0.7,
        maxTokens: chatbot.maxTokens || 1000,
        visibility: chatbot.visibility || 'private',
        publicLinkEnabled: chatbot.publicLinkEnabled || false,
        integrationEnabled: chatbot.integrationEnabled || false,
        branding: {
          widgetColor: chatbot.branding?.widgetColor || '#007bff',
          widgetPosition: chatbot.branding?.widgetPosition || 'bottom-right',
          widgetTitle: chatbot.branding?.widgetTitle || 'Chat with us',
          welcomeMessage: chatbot.branding?.welcomeMessage || 'How can I help you today?',
        },
      });
    }
  }, [chatbot]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const handleBrandingChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.temperature < 0 || formData.temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    if (formData.maxTokens < 1 || formData.maxTokens > 4000) {
      newErrors.maxTokens = 'Max tokens must be between 1 and 4000';
    }

    if (formData.systemPrompt.length > 2000) {
      newErrors.systemPrompt = 'System prompt must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find the first tab with errors and switch to it
      const errorFields = Object.keys(errors);
      if (errorFields.includes('name') || errorFields.includes('description')) {
        setActiveTab('basic');
      } else if (errorFields.includes('systemPrompt') || errorFields.includes('temperature') || errorFields.includes('maxTokens')) {
        setActiveTab('model');
      }
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateChatbot({ id: chatbot.id, data: formData })).unwrap();
        createNotification(dispatch, { message: 'Chatbot updated successfully! 🎉', type: 'success' });
      } else {
        await dispatch(createChatbot(formData)).unwrap();
        createNotification(dispatch, { message: 'Chatbot created successfully! 🎉', type: 'success' });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/chatbots');
      }
    } catch (error) {
      createNotification(dispatch, { 
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} chatbot`, 
        type: 'error' 
      });
    }
  };

  const copyIntegrationCode = useCallback(() => {
    const code = `<script src="https://your-domain.com/widget.js"></script>
<script>
  window.ChatbotWidget.init({
    chatbotId: "${chatbot?.id || 'CHATBOT_ID'}",
    color: "${formData.branding.widgetColor}",
    position: "${formData.branding.widgetPosition}",
    title: "${formData.branding.widgetTitle}",
    welcomeMessage: "${formData.branding.welcomeMessage}"
  });
</script>`;
    
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [chatbot?.id, formData.branding]);

  const getTabIcon = (tab) => {
    const icons = {
      basic: Bot,
      model: Settings,
      branding: Palette,
      integration: Globe
    };
    return icons[tab];
  };

  const getCompletionIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-600" />
                {isEditing ? 'Edit Chatbot' : 'Create New Chatbot'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEditing ? 'Update your chatbot configuration' : 'Configure your AI-powered chatbot'}
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {completionProgress}% Complete
            </Badge>
          </div>
          
          <Progress value={completionProgress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12">
              {['basic', 'model', 'branding', 'integration'].map((tab) => {
                const Icon = getTabIcon(tab);
                const status = tabCompletionStatus[tab];
                return (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="flex items-center gap-2 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                    {getCompletionIcon(status)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1">
                        Name *
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose a descriptive name for your chatbot</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Customer Support Bot"
                        className={`transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                        maxLength={100}
                      />
                      <div className="flex justify-between items-center">
                        {errors.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {formData.name.length}/100
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) => handleInputChange('visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              🔒 Private
                              <span className="text-xs text-gray-500">Only you can access</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              🌐 Public
                              <span className="text-xs text-gray-500">Anyone with link can access</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what this chatbot does and how it helps users..."
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      {errors.description && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {formData.description.length}/500
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="publicLink" className="font-medium">Public Link</Label>
                        <p className="text-sm text-gray-500">Allow sharing via public URL</p>
                      </div>
                      <Switch
                        id="publicLink"
                        checked={formData.publicLinkEnabled}
                        onCheckedChange={(checked) => handleInputChange('publicLinkEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="integration" className="font-medium">Widget Integration</Label>
                        <p className="text-sm text-gray-500">Embed on your website</p>
                      </div>
                      <Switch
                        id="integration"
                        checked={formData.integrationEnabled}
                        onCheckedChange={(checked) => handleInputChange('integrationEnabled', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Settings Tab */}
            <TabsContent value="model" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>AI Model</Label>
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900 dark:text-blue-100">
                            Gemma 3 27B-IT
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Advanced language model optimized for chat interactions
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Recommended
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="systemPrompt" className="flex items-center gap-1">
                      System Prompt
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Instructions that define your chatbot's personality and behavior</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Textarea
                      id="systemPrompt"
                      value={formData.systemPrompt}
                      onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                      placeholder="You are a helpful customer support assistant. Be friendly, professional, and provide accurate information..."
                      rows={4}
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center">
                      {errors.systemPrompt && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.systemPrompt}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {formData.systemPrompt.length}/2000
                      </p>
                    </div>
                    
                    {!formData.systemPrompt && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          A system prompt helps define your chatbot's personality and ensures consistent responses.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="temperature" className="flex items-center justify-between">
                        <span>Temperature: {formData.temperature}</span>
                        <div className="flex gap-1">
                          {TEMPERATURE_PRESETS.map((preset) => (
                            <Button
                              key={preset.value}
                              type="button"
                              variant={Math.abs(formData.temperature - preset.value) < 0.1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleInputChange('temperature', preset.value)}
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </Label>
                      <Slider
                        id="temperature"
                        min={0}
                        max={2}
                        step={0.1}
                        value={[formData.temperature]}
                        onValueChange={(value) => handleInputChange('temperature', value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Lower values = more focused, Higher values = more creative
                      </p>
                      {errors.temperature && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.temperature}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="maxTokens">Max Tokens: {formData.maxTokens}</Label>
                      <Slider
                        id="maxTokens"
                        min={100}
                        max={4000}
                        step={100}
                        value={[formData.maxTokens]}
                        onValueChange={(value) => handleInputChange('maxTokens', value[0])}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum length of AI responses (~{Math.round(formData.maxTokens * 0.75)} words)
                      </p>
                      {errors.maxTokens && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.maxTokens}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Widget Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="widgetTitle">Widget Title</Label>
                      <Input
                        id="widgetTitle"
                        value={formData.branding.widgetTitle}
                        onChange={(e) => handleBrandingChange('widgetTitle', e.target.value)}
                        placeholder="Chat with us"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={formData.branding.welcomeMessage}
                        onChange={(e) => handleBrandingChange('welcomeMessage', e.target.value)}
                        placeholder="How can I help you today?"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="widgetColor">Widget Color</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="color"
                          value={formData.branding.widgetColor}
                          onChange={(e) => handleBrandingChange('widgetColor', e.target.value)}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          value={formData.branding.widgetColor}
                          onChange={(e) => handleBrandingChange('widgetColor', e.target.value)}
                          placeholder="#007bff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="widgetPosition">Widget Position</Label>
                      <Select
                        value={formData.branding.widgetPosition}
                        onValueChange={(value) => handleBrandingChange('widgetPosition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WIDGET_POSITIONS.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              <div className="flex items-center gap-2">
                                <span>{position.icon}</span>
                                {position.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Live Preview
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'Hide' : 'Show'} Chat
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      {/* Preview Website Frame */}
                      <div className="absolute inset-2 bg-white dark:bg-gray-700 rounded shadow-sm">
                        <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded-t flex items-center px-2 gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                        
                        {/* Chat Widget */}
                        <div 
                          className="absolute w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-all hover:scale-110"
                          style={{ 
                            backgroundColor: formData.branding.widgetColor,
                            [formData.branding.widgetPosition.includes('right') ? 'right' : 'left']: '12px',
                            [formData.branding.widgetPosition.includes('bottom') ? 'bottom' : 'top']: '12px'
                          }}
                        >
                          <MessageCircle className="w-6 h-6" />
                        </div>

                        {/* Chat Window */}
                        {showPreview && (
                          <div 
                            className="absolute w-72 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border"
                            style={{
                              [formData.branding.widgetPosition.includes('right') ? 'right' : 'left']: '12px',
                              [formData.branding.widgetPosition.includes('bottom') ? 'bottom' : 'top']: '70px'
                            }}
                          >
                            <div 
                              className="h-12 rounded-t-lg flex items-center px-4 text-white font-medium"
                              style={{ backgroundColor: formData.branding.widgetColor }}
                            >
                              {formData.branding.widgetTitle}
                            </div>
                            <div className="p-4">
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm">
                                {formData.branding.welcomeMessage}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Integration Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="font-medium">Public Link Access</Label>
                          <p className="text-sm text-gray-500">
                            Generate a public URL that anyone can use to chat with your bot
                          </p>
                          {formData.publicLinkEnabled && (
                            <Badge variant="outline" className="mt-2">
                              Link will be generated after creation
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={formData.publicLinkEnabled}
                          onCheckedChange={(checked) => handleInputChange('publicLinkEnabled', checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="font-medium">Website Widget</Label>
                          <p className="text-sm text-gray-500">
                            Embed the chatbot as a widget on your website
                          </p>
                          {formData.integrationEnabled && (
                            <Badge variant="outline" className="mt-2">
                              Integration code will be provided
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={formData.integrationEnabled}
                          onCheckedChange={(checked) => handleInputChange('integrationEnabled', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {formData.integrationEnabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        Integration Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Copy this code and paste it before the closing &lt;/body&gt; tag of your website.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="relative">
                          <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-x-auto">
                            <code>{`<script src="https://your-domain.com/widget.js"></script>
<script>
  window.ChatbotWidget.init({
    chatbotId: "${chatbot?.id || 'CHATBOT_ID'}",
    color: "${formData.branding.widgetColor}",
    position: "${formData.branding.widgetPosition}",
    title: "${formData.branding.widgetTitle}",
    welcomeMessage: "${formData.branding.welcomeMessage}"
  });
</script>`}</code>
                          </pre>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={copyIntegrationCode}
                          >
                            {copiedCode ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {Object.keys(errors).length > 0 && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before submitting
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/chatbots')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || Object.keys(errors).length > 0}
                    className="min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {isEditing ? 'Update Chatbot' : 'Create Chatbot'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </TooltipProvider>
  );
}

export default ChatbotForm;