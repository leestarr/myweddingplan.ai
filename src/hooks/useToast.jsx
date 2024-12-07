import { useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';

const Toast = ({ message, type, onClose }) => {
  return (
    <Alert
      severity={type}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}
    >
      {message}
    </Alert>
  );
};

export const useToast = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const showToast = useCallback((newMessage, type = 'success') => {
    setMessage(newMessage);
    setSeverity(type);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const ToastComponent = () => (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );

  return {
    showToast,
    ToastComponent
  };
};

export default useToast;
