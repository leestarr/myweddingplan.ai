import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Button } from '@mui/material';
import { ChatBubbleOutline, Code, Explore, History } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChatLayout = ({ children }) => {
  const theme = useTheme();

  const mainNavigation = [
    { name: 'Wedding Planning Assistant', icon: ChatBubbleOutline },
    { name: 'Venue Search', icon: Code },
    { name: 'Explore Features', icon: Explore },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              mb: 2,
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
            }}
          >
            + New chat
          </Button>
        </Box>

        <List>
          {mainNavigation.map((item) => (
            <ListItem
              key={item.name}
              button
              sx={{
                py: 1,
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: theme.palette.text.secondary }}>
          Today
        </Typography>
        
        <List>
          <ListItem button sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Wedding Venue Search" secondary="New conversation" />
          </ListItem>
        </List>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Powered by Google Gemini
          </Typography>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default ChatLayout;
