import { Box, Button, Stack, TextField } from '@mui/material';
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
      </Stack>

      {/* Input Field, Send Button, Clear Chat */}
      <Stack direction="row" spacing={2} padding={2} sx={{ width: '100%', bottom: 0 }}>
        {/* Input Field */}
        <TextField
          label={t('Message')}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        ></TextField>

        {/* Send Button */}
        <Button
          variant="outlined"
          onClick={sendMessage}
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
          {t('send')}
        </Button>

        {/* Clear Chat Button */}
        <Button
          onClick={clearChatLog}
          variant="outlined"
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
