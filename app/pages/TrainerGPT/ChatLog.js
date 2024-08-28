import { useState, useEffect, useRef } from 'react';
import { Box, Button, Stack, TextField, CircularProgress } from '@mui/material';
import AssistantIcon from '@mui/icons-material/Assistant';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';

const ChatLog = ({
  messages,
  message,
  setMessage,
  isLoading,
  sendMessage,
  clearChatLog,
  handleKeyPress,
  customComponents,
  t,
  isMobile
}) => {
  const chatEndRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(messages.length <= 1); // State to manage visibility of suggestions

  // Example suggested inputs
  const suggestions = [
    t("This is the equipment I have available: "),
    t("Make me a workout plan"),
    t("How do I do a push up?")
  ];

  // Scroll to the bottom of the chat log when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hide suggestions when the user starts typing
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  // Enhanced clearChatLog function
  const handleClearChatLog = () => {
    clearChatLog(); // Call the original clearChatLog function
    setShowSuggestions(true); // Reset showSuggestions state
  };

  return (
    <Stack
      direction="column"
      width="100vw"
      minHeight={isMobile ? "80vh" : "90vh"}
      paddingBottom='60px' // Ensure content is not cut off by the toolbar
    >
      {/* Messages */}
      <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className="chat-log">
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
          >
            {message.role === 'assistant' && (
              <AssistantIcon sx={{ mr: 1, color: 'text.primary', fontSize: '2.5rem' }} />
            )}
            <Box
              bgcolor={message.role === 'assistant' ? 'background.bubbles' : 'background.userBubble'}
              color={message.role === 'assistant' ? "text.primary" : 'black'}
              borderRadius={3.5}
              padding={2.5}
              sx={{
                maxWidth: '75%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <ReactMarkdown components={customComponents}>{message.content}</ReactMarkdown>
            </Box>
            {message.role === 'user' && (
              <PersonIcon sx={{ ml: 1, color: 'text.primary', fontSize: '2.5rem' }} />
            )}
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Stack>

      {showSuggestions && (
      <Stack
        direction="row"
        spacing={2}
        padding={2}
        paddingX={isMobile ? 2 : 15}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        sx={{
          width: isMobile ? '100%' : '92.5%',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          gap: 2, // Increased gap for better spacing between buttons
        }}
      >
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => handleSuggestionClick(suggestion)}
            sx={{
              textTransform: 'none', // Keep the text as is without uppercase transformation
              backgroundColor: 'background.default', // Background color similar to ChatGPT
              color: 'text.primary', // Text color
              borderRadius: '9999px', // Full rounded corners for pill-like shape
              paddingX: 3, // Horizontal padding
              paddingY: 1.5, // Vertical padding
              minWidth: 180, // Consistent width
              height: 'auto', // Flexible height based on content
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              whiteSpace: 'normal', // Allow text to wrap if it's too long
              boxShadow: 1, // Subtle shadow for depth
              '&:hover': {
                backgroundColor: 'primary.light', // Hover effect similar to ChatGPT
                boxShadow: 2, // Slightly stronger shadow on hover
              },
            }}
          >
            {suggestion}
          </Button>
        ))}
      </Stack>
    )}




      {/* Input Field, Send Button, Clear Chat */}
      <Stack direction="row" spacing={2} padding={2} sx={{ width: '100%', bottom: 0 }}>
        {/* Input Field */}
        <TextField
          label={t('Message')}
          fullWidth
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          aria-label={t('Message input field')}
        />

        {/* Send Button */}
        <Button
          variant="outlined"
          onClick={sendMessage}
          disabled={isLoading}
          sx={{
            color: 'text.primary',
            borderColor: 'text.primary',
            '&:hover': {
              backgroundColor: 'text.primary',
              color: 'background.default',
              borderColor: 'text.primary',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : t('send')}
        </Button>

        {/* Clear Chat Button */}
        <Button
          onClick={handleClearChatLog} // Use the enhanced clearChatLog
          variant="outlined"
          disabled={isLoading}
          sx={{
            color: 'text.primary',
            borderColor: 'text.primary',
            '&:hover': {
              backgroundColor: 'text.primary',
              color: 'background.default',
              borderColor: 'text.primary',
            },
          }}
        >
          {t('clear')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ChatLog;
