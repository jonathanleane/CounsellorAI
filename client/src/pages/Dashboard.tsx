import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  ChatBubbleOutline as ChatIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { sessionsApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useProfileStore((state) => state.profile);
  const [selectedModel, setSelectedModel] = useState('gpt-4.5-preview');

  // Fetch recent sessions
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', 'recent'],
    queryFn: () => sessionsApi.getRecent(5),
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (response) => {
      navigate(`/conversation/${response.data.id}`);
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const startNewSession = () => {
    createSessionMutation.mutate({
      session_type: 'standard',
      initial_mood: 7,
      model: selectedModel,
    });
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'success';
    if (mood >= 6) return 'info';
    if (mood >= 4) return 'warning';
    return 'error';
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'intake':
        return 'Initial Assessment';
      case 'crisis':
        return 'Crisis Support';
      case 'followup':
        return 'Follow-up';
      default:
        return 'Regular Session';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {profile?.name || 'there'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ChatIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">New Session</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start a new therapy conversation
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={startNewSession}
                disabled={createSessionMutation.isPending}
              >
                Start Conversation
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Session History</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review your past conversations
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Your Profile</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update your preferences and goals
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Sessions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recent Sessions
      </Typography>

      {sessionsLoading ? (
        <LinearProgress />
      ) : recentSessions?.data?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No sessions yet. Start your first conversation to begin your therapy journey.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {recentSessions?.data?.map((session: any) => (
            <Grid item xs={12} key={session.id}>
              <Paper
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/conversation/${session.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        {getSessionTypeLabel(session.session_type)}
                      </Typography>
                      {session.initial_mood && (
                        <Chip
                          label={`Mood: ${session.initial_mood}/10`}
                          size="small"
                          color={getMoodColor(session.initial_mood)}
                        />
                      )}
                      <Chip
                        label={session.status}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                    </Typography>
                    {session.ai_summary && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        "{session.ai_summary.substring(0, 150)}..."
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this session?')) {
                        deleteSessionMutation.mutate(session.id);
                      }
                    }}
                    disabled={deleteSessionMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Your Progress
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">
                {recentSessions?.data?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Primary Goal
              </Typography>
              <Typography variant="body1">
                {profile?.therapy_goals?.primary_goal || 'Not set'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Preferred Style
              </Typography>
              <Typography variant="body1">
                {profile?.preferences?.communication_style || 'Not set'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}