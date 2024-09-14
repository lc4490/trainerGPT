// customMarkdownComponents.js
import { Box, Link, Typography } from '@mui/material';

export const customComponents = {
  a: ({ href, children }) => (
    <Link href={href} color="background.link" underline="hover">
      {children}
    </Link>
  ),
  p: ({ children }) => (
    <Typography variant="body1" paragraph sx={{ marginBottom: 0, lineHeight: 1.6 }}>
      {children}
    </Typography>
  ),
  h1: ({ children }) => (
    <Typography variant="h4" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ paddingLeft: 3, marginBottom: 0 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ paddingLeft: 3, marginBottom: 0 }}>
      {children}
    </Box>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{
        marginLeft: 2,
        paddingLeft: 2,
        borderLeft: '4px solid #ccc',
        fontStyle: 'italic',
        color: '#555',
        marginBottom: 0,
      }}
    >
      {children}
    </Box>
  ),
  code: ({ children }) => (
    <Box
      component="code"
      sx={{
        backgroundColor: '#f5f5f5',
        padding: '8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        marginBottom: 0,
      }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        backgroundColor: '#f5f5f5',
        padding: '8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        overflowX: 'auto',
        marginBottom: 0,
      }}
    >
      {children}
    </Box>
  ),
};
