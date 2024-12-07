import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ArticleIcon from '@mui/icons-material/Article';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';

const genAI = new GoogleGenerativeAI("AIzaSyDhd0NRwRck8vJ9RVv_Wi-2nArMYLmetZc");

const suggestionButtons = [
  { icon: ImageIcon, label: 'Create image' },
  { icon: AnalyticsIcon, label: 'Analyze data' },
  { icon: LightbulbIcon, label: 'Brainstorm' },
  { icon: ArticleIcon, label: 'Summarize text' },
  { icon: MoreHorizIcon, label: 'More' },
];

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const { user } = useAuth();

  // Debug log when component mounts
  useEffect(() => {
    console.log('AIChat mounted, user:', user);
  }, []);

  // Test Firebase connection on mount
  useEffect(() => {
    const testFirebaseConnection = async () => {
      if (user?.uid) {
        try {
          console.log('Testing Firebase connection with user:', {
            email: user.email,
            uid: user.uid
          });

          // Try to save a test message
          const testMessage = {
            text: 'Firebase connection test',
            sender: 'system',
            timestamp: new Date().toISOString()
          };

          const messageId = await chatService.saveMessage(user.uid, testMessage);
          console.log('Successfully saved test message to Firebase:', messageId);
        } catch (error) {
          console.error('Firebase connection test failed:', error);
        }
      } else {
        console.warn('No authenticated user found');
      }
    };

    testFirebaseConnection();
  }, [user]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.uid) {
        try {
          setIsLoading(true);
          console.log('Loading chat history for user:', user.uid);
          const history = await chatService.getChatHistory(user.uid);
          console.log('Loaded chat history:', history);
          setMessages(history);
        } catch (error) {
          console.error('Error loading chat history:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn('No user ID available for chat history');
      }
    };
    loadChatHistory();
  }, [user?.uid]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      console.warn('Empty input, not sending');
      return;
    }
    
    if (!user?.uid) {
      console.error('No user ID available, cannot send message');
      return;
    }

    console.log('Sending message with user ID:', user.uid);

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString() // Add client-side timestamp for immediate display
    };

    try {
      // Save user message to Firebase
      console.log('Attempting to save user message:', userMessage);
      const messageId = await chatService.saveMessage(user.uid, userMessage);
      console.log('Successfully saved message with ID:', messageId);

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      // Get AI response
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      const aiMessage = {
        text: text,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      // Save AI response to Firebase
      console.log('Attempting to save AI response:', aiMessage);
      const aiMessageId = await chatService.saveMessage(user.uid, aiMessage);
      console.log('Successfully saved AI response with ID:', aiMessageId);

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      const errorMessage = {
        text: "I apologize, but I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      try {
        await chatService.saveMessage(user.uid, errorMessage);
        setMessages(prev => [...prev, errorMessage]);
      } catch (saveError) {
        console.error('Failed to save error message:', saveError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
      px: { xs: 2, md: 4 },
      py: 3,
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 600,
          color: '#0288d1', 
          mb: 1 
        }}>
          Wedding Planning Assistant
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#666',
          fontWeight: 400 
        }}>
          Your AI assistant for all wedding planning questions
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        mb: 4,
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Search previous conversations..."
          variant="outlined"
          fullWidth
          sx={{
            maxWidth: 400,
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.1)',
              },
              '&:hover fieldset': {
                borderColor: '#0288d1',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0288d1',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Chat Area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: 0,
      }}>
        {messages.length === 0 ? (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h5" sx={{ 
              textAlign: 'center',
              color: '#0288d1',
              fontWeight: 500,
            }}>
              How can I assist with your wedding planning?
            </Typography>
            
            <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 800 }}>
              {suggestionButtons.map((btn, index) => (
                <Grid item key={index}>
                  <Button
                    variant="outlined"
                    startIcon={<btn.icon sx={{ color: '#0288d1' }} />}
                    sx={{
                      borderColor: 'rgba(0,0,0,0.1)',
                      color: '#0288d1',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        borderColor: '#0288d1',
                      },
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                    }}
                  >
                    {btn.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: message.sender === 'ai' ? '#e3f2fd' : 'white', 
                }}
              >
                <Typography sx={{
                  color: message.sender === 'ai' ? '#0288d1' : '#1A1A1A', 
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  '& p': { mb: 2 },
                  '& p:last-child': { mb: 0 },
                }}>
                  {message.text}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}

        {/* Input Area */}
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <Box sx={{ 
            position: 'relative',
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your wedding planning question..."
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0288d1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0288d1',
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              sx={{
                position: 'absolute',
                right: 8,
                bottom: 8,
                backgroundColor: '#0288d1',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#0277bd',
                },
                width: 32,
                height: 32,
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  color: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>
          
          <Typography variant="caption" sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 2, 
            color: '#666' 
          }}>
            AI Assistant can make mistakes. Consider checking important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AIChat;
