import { useState, useEffect, useRef } from 'react';
import { Box, Button, Stack, TextField, CircularProgress } from '@mui/material';
import Image from 'next/image';
import AssistantIcon from '@mui/icons-material/Assistant';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete'; 
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import StopIcon from '@mui/icons-material/Stop';
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
  handleMicrophoneClick,
  isSpeaking,
  isListening,
  incompleteResponse,
  handleContinue,
  image,
  t,
  isMobile
}) => {
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

  // scroll to bottom
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if(!isMobile){scrollToBottom();}
    }, 100); // Delay to allow DOM to update
    return () => clearTimeout(timer);
  }, [messages]);  

  return (
    <Stack direction="column" width="100%" 
    minHeight={isMobile ? "80vh" : "90vh"} 
    height={isMobile ? "80vh" : "90vh"} 
    paddingBottom='60px'
    >
      {/* Messages */}
      <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className="chat-log">
        {messages?.map((message, index) => (
          <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
            {message.role === 'assistant' && (
              <AssistantIcon sx={{ mr: 1, color: 'text.primary', fontSize: '2.5rem' }} />
            )}
            <Box
              bgcolor={message.role === 'assistant' ? 'background.bubbles' : 'background.userBubble'}
              color={message.role === 'assistant' ? "text.primary" : 'white'}
              borderRadius={3.5}
              padding={2.5}
              sx={{ maxWidth: '75%', wordBreak: 'break-word', overflowWrap: 'break-word' }}
            >
              <ReactMarkdown components={customComponents}>{message.content}</ReactMarkdown>
            </Box>
            {message.role === 'user' && (
              <Image
              src={image}
              alt={t("image")}
              width={45}
              height={45}
              style={{
                  marginLeft: 10,
                  borderRadius: "9999px",
                  objectFit: 'cover',
                  transform:  "scaleX(-1)",
              }}
              />
              // <PersonIcon sx={{ ml: 1, color: 'text.primary', fontSize: '2.5rem' }} />
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
        
      </Stack>
      {/* Show Continue button if response is incomplete */}
      {incompleteResponse && (
        <Box display = "flex" justifyContent={"end"}>
          <Button 
          onClick={handleContinue} 
          variant="contained"
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
            border: '0.1px solid', // Add this line for the border
            borderColor: 'primary.main', // You can change the color as needed
            '&:hover': {
              backgroundColor: 'primary.light',
              boxShadow: 2,
            },
          }}
          >
            {t("Continue")}
          </Button>
        </Box>
        )}

      {showSuggestions && (
        <Stack
          direction="row"
          spacing={2}
          padding={2}
          paddingX={isMobile ? 0 : 20}
          justifyContent="space-between" // Align items to the start for horizontal scroll
          alignItems="center"
          flexWrap="nowrap" // Prevent wrapping
          sx={{
            // width: isMobile ? '100%' : '92.5%',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            gap: 2,
            overflowX: 'auto', // Enable horizontal scrolling
            whiteSpace: 'nowrap', // Prevent items from breaking to the next line
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
            },
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
      <Stack direction="row" spacing={1} padding={2} sx={{ width: '100%', bottom: 0 }}>
        <TextField
          placeholder={t('Message')}
          fullWidth
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          aria-label={t('Message input field')}
          sx={{
            borderRadius: '9999px', // Circular shape
            '& .MuiInputBase-root': {
              borderRadius: '9999px', // Circular input field
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '9999px', // Circular outline
            },
            height: '48px', // Adjust the height to make it more circular
          }}
        />

          <Button
            onClick={handleMicrophoneClick} // Single click handler for all states
            variant="outlined"
            disabled={isLoading} // Disable while loading
            sx={{
              color: 'text.primary',
              borderColor: 'text.primary',
              borderRadius: '9999px', // Circular shape
              height: '48px', // Match height with TextField
              width: '48px', // Make it circular
              minWidth: '48px', // Ensure button stays circular
              '&:hover': {
                backgroundColor: 'text.primary',
                color: 'background.default',
                borderColor: 'text.primary',
              },
            }}
          >
            {isSpeaking ? <StopIcon /> : isListening ? <SettingsVoiceIcon /> : <KeyboardVoiceIcon />}
          </Button>
        <Button
          variant="outlined"
          onClick={sendMessage}
          disabled={isLoading}
          sx={{
            color: 'text.primary',
            borderColor: 'text.primary',
            borderRadius: '9999px', // Circular shape
            height: '48px', // Match height with TextField
            width: '48px', // Make it circular
            minWidth: '48px', // Ensure button stays circular
            '&:hover': {
              backgroundColor: 'text.primary',
              color: 'background.default',
              borderColor: 'text.primary',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </Button>
        <Button
          onClick={() => {
            if (window.confirm(t('Are you sure you want to delete the chat?'))) {
              clearChatLog(); // Only clear the chat log if the user confirms
              setShowSuggestions(true)
            }
          }}
          variant="outlined"
          disabled={isLoading}
          sx={{
            color: 'text.primary',
            borderColor: 'text.primary',
            borderRadius: '9999px', // Circular shape
            height: '48px', // Match height with TextField
            width: '48px', // Make it circular
            minWidth: '48px', // Ensure button stays circular
            '&:hover': {
              backgroundColor: 'text.primary',
              color: 'background.default',
              borderColor: 'text.primary',
            },
          }}
        >
          <DeleteIcon />
        </Button>
      </Stack>

    </Stack>
  );
};

export default ChatLog;
