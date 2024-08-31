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
  const [showSuggestions, setShowSuggestions] = useState(messages.length <= 1);

  const suggestions = [
    t("This is the equipment I have available: "),
    t("Make me a workout plan"),
    t("How do I do a push up?")
  ];

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Stack direction="column" width="100vw" minHeight={isMobile ? "80vh" : "90vh"} paddingBottom='60px'>
      {/* Messages */}
      <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className="chat-log">
        {console.log(messages)}
        {messages?.map((message, index) => (
          <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
            {message.role === 'assistant' && (
              <AssistantIcon sx={{ mr: 1, color: 'text.primary', fontSize: '2.5rem' }} />
            )}
            <Box
              bgcolor={message.role === 'assistant' ? 'background.bubbles' : 'background.userBubble'}
              color={message.role === 'assistant' ? "text.primary" : 'black'}
              borderRadius={3.5}
              padding={2.5}
              sx={{ maxWidth: '75%', wordBreak: 'break-word', overflowWrap: 'break-word' }}
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
            gap: 2,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outlined"
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                textTransform: 'none',
                backgroundColor: 'background.default',
                color: 'text.primary',
                borderRadius: '9999px',
                paddingX: 3,
                paddingY: 1.5,
                minWidth: 180,
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                whiteSpace: 'normal',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  boxShadow: 2,
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
          <TextField
            label={t('Message')}
            fullWidth
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            aria-label={t('Message input field')}
          />
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
        <Button
          onClick={clearChatLog}
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
