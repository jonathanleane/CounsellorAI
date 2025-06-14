import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { sessionsApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const startTimeRef = useRef<Date>(new Date());
  const [showLearningSnackbar, setShowLearningSnackbar] = useState(false);
  const [learningMessage, setLearningMessage] = useState('');
  const hasTriedCreatingSession = useRef(false);
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false);

  // Fetch session data
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionsApi.get(id!),
    enabled: !!id && id !== 'new',
  });

  // Create new session if needed
  const createSessionMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (response) => {
      // Navigate to the new session ID
      navigate(`/conversation/${response.data.id}`, { replace: true });
    },
    onError: () => {
      // Reset the flag on error so user can retry
      hasTriedCreatingSession.current = false;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      sessionsApi.addMessage(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      setMessage('');
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: ({ sessionId, duration }: { sessionId: string; duration: number }) =>
      sessionsApi.end(sessionId, duration),
    onSuccess: async () => {
      // Wait for the session to be updated with learning data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch the updated session to check for learning
      try {
        const updatedSession = await sessionsApi.get(id!);
        if (updatedSession.data.learning_changes) {
          const changes = updatedSession.data.learning_changes;
          if (changes.length > 0) {
            setLearningMessage(`I learned ${changes.length} new thing${changes.length > 1 ? 's' : ''} about you from this session!`);
            setShowLearningSnackbar(true);
            
            // Navigate after showing the snackbar
            setTimeout(() => {
              navigate('/history');
            }, 3000);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking learning data:', error);
      }
      
      // Navigate immediately if no learning data
      navigate('/');
    },
  });

  // Timer effect with proper cleanup
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only start timer if session is active
    if (session?.data?.status === 'active') {
      startTimeRef.current = new Date(); // Reset start time when session becomes active
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setSessionDuration(elapsed);
      }, 1000);
    }

    // Cleanup function that properly clears the timer
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [session?.data?.status, id]); // Add dependencies to restart timer when session status changes

  // Create new session if we're on /conversation/new
  useEffect(() => {
    if (id === 'new' && !hasTriedCreatingSession.current && !createSessionMutation.isPending && !createSessionMutation.isSuccess) {
      hasTriedCreatingSession.current = true; // Prevent multiple attempts
      
      // Get user's model preference from profile
      const profileData = useProfileStore.getState().profile;
      let modelPreference;
      
      if (profileData?.preferences) {
        try {
          const prefs = typeof profileData.preferences === 'string' 
            ? JSON.parse(profileData.preferences) 
            : profileData.preferences;
          modelPreference = prefs.ai_model;
        } catch (error) {
          console.error('Error parsing preferences:', error);
          // Continue without model preference
        }
      }
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
      createSessionMutation.mutate({
        session_type: 'standard',
        ...(modelPreference && { model: modelPreference }),
      });
    }
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.data?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !id || id === 'new') return;
    
    sendMessageMutation.mutate({
      sessionId: id,
      content: message.trim(),
    });
  };

  const handleEndSession = () => {
    if (!id || id === 'new') return;
    setEndSessionDialogOpen(true);
  };

  const confirmEndSession = () => {
    if (!id || id === 'new') return;
    endSessionMutation.mutate({
      sessionId: id,
      duration: sessionDuration,
    });
    setEndSessionDialogOpen(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionLoading || createSessionMutation.isPending) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>
          {createSessionMutation.isPending ? 'Creating session...' : 'Loading conversation...'}
        </Typography>
      </Container>
    );
  }

  if (!session?.data && id !== 'new') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Session not found</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  const messages = session?.data?.messages || [];
  const isActive = session?.data?.status === 'active';

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {session?.data?.session_type === 'intake' ? 'Initial Assessment' : 'Therapy Session'}
            </Typography>
            {session?.data?.model && (
              <Chip size="small" label={session.data.model} />
            )}
          </Box>
          {isActive && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleEndSession}
              disabled={endSessionMutation.isPending}
            >
              End Session
            </Button>
          )}
        </Box>
      </Paper>

      {/* Messages */}
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg: Message) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <Avatar sx={{ bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main' }}>
                {msg.role === 'user' ? <PersonIcon /> : <PsychologyIcon />}
              </Avatar>
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                  color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    opacity: 0.7,
                    color: msg.role === 'user' ? 'inherit' : 'text.secondary',
                  }}
                >
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </Typography>
              </Paper>
            </Box>
          ))}
          {sendMessageMutation.isPending && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <PsychologyIcon />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Thinking...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Input */}
      {isActive ? (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              Send
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Alert severity="info">
            This session has ended. View your session history to see the summary.
          </Alert>
        </Paper>
      )}
      
      {/* Learning Notification */}
      <Snackbar
        open={showLearningSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowLearningSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowLearningSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          🧠 {learningMessage}
        </Alert>
      </Snackbar>

      {/* End Session Confirmation Dialog */}
      <ConfirmDialog
        open={endSessionDialogOpen}
        title="End Session"
        message="Are you sure you want to end this session? The AI will generate a summary of your conversation."
        confirmText="End Session"
        cancelText="Continue Session"
        onConfirm={confirmEndSession}
        onCancel={() => setEndSessionDialogOpen(false)}
      />
    </Container>
  );
}