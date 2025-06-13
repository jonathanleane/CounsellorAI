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
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { sessionsApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';

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
  const profile = useProfileStore((state) => state.profile);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const startTimeRef = useRef<Date>(new Date());
  const [showLearningSnackbar, setShowLearningSnackbar] = useState(false);
  const [learningMessage, setLearningMessage] = useState('');

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
      setSessionDuration(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          const changes = JSON.parse(updatedSession.data.learning_changes);
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

  // Create new session if we're on /conversation/new
  useEffect(() => {
    if (id === 'new' && !createSessionMutation.isPending && !createSessionMutation.isSuccess) {
      createSessionMutation.mutate({
        session_type: 'standard',
        initial_mood: 7,
        model: 'gpt-4-turbo-preview',
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
    
    if (window.confirm('Are you sure you want to end this session?')) {
      endSessionMutation.mutate({
        sessionId: id,
        duration: sessionDuration,
      });
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<TimerIcon />}
              label={formatDuration(sessionDuration)}
              color="primary"
              variant="outlined"
            />
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
    </Container>
  );
}