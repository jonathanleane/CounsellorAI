import { useState } from 'react';
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
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { sessionsApi } from '@/services/api';

interface Session {
  id: string;
  session_type: string;
  status: string;
  initial_mood?: number;
  timestamp: string;
  duration?: number;
  messages: Array<{ id: string; role: string; content: string; timestamp: string }>;
  ai_summary?: string;
  identified_patterns?: string[];
  followup_suggestions?: string[];
  learned_details?: string;
  learning_changes?: string;
}

export default function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Fetch all sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', 'all'],
    queryFn: () => sessionsApi.getAll(),
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // Filter sessions
  const filteredSessions = sessions?.data?.filter((session: Session) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesContent = session.messages?.some(msg => 
        msg.content.toLowerCase().includes(searchLower)
      );
      const matchesSummary = session.ai_summary?.toLowerCase().includes(searchLower);
      if (!matchesContent && !matchesSummary) return false;
    }

    // Type filter
    if (filterType !== 'all' && session.session_type !== filterType) {
      return false;
    }

    return true;
  }) || [];

  // Group sessions by week
  const groupedSessions = filteredSessions.reduce((groups: Record<string, { weekKey: string; start: Date; end: Date; sessions: Session[] }>, session: Session) => {
    const date = new Date(session.timestamp);
    const weekStart = startOfWeek(date);
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!groups[weekKey]) {
      groups[weekKey] = {
        start: weekStart,
        end: endOfWeek(date),
        sessions: [],
      };
    }
    
    groups[weekKey].sessions.push(session);
    return groups;
  }, {});

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

  const exportSession = (session: Session) => {
    const content = {
      sessionInfo: {
        id: session.id,
        type: session.session_type,
        date: session.timestamp,
        duration: session.duration,
        initialMood: session.initial_mood,
      },
      messages: session.messages,
      summary: session.ai_summary,
      patterns: session.identified_patterns,
      suggestions: session.followup_suggestions,
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}-${format(new Date(session.timestamp), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Loading session history...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Session History
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(e, value) => value && setFilterType(value)}
              fullWidth
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="standard">Regular</ToggleButton>
              <ToggleButton value="intake">Intake</ToggleButton>
              <ToggleButton value="crisis">Crisis</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => value && setViewMode(value)}
              fullWidth
            >
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Sessions */}
      {filteredSessions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || filterType !== 'all' 
              ? 'No sessions match your search criteria.'
              : 'No sessions found. Start a conversation to begin building your history.'}
          </Typography>
        </Paper>
      ) : viewMode === 'list' ? (
        // List view
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(groupedSessions)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([weekKey, weekData]: [string, any]) => (
              <Box key={weekKey}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Week of {format(weekData.start, 'MMMM d, yyyy')}
                </Typography>
                {weekData.sessions
                  .sort((a: Session, b: Session) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )
                  .map((session: Session) => (
                    <Accordion
                      key={session.id}
                      expanded={expandedSession === session.id}
                      onChange={(e, isExpanded) => 
                        setExpandedSession(isExpanded ? session.id : null)
                      }
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <ChatIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1">
                              {getSessionTypeLabel(session.session_type)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(session.timestamp), 'PPp')}
                              </Typography>
                              {session.initial_mood && (
                                <Chip
                                  label={`Mood: ${session.initial_mood}/10`}
                                  size="small"
                                  color={getMoodColor(session.initial_mood)}
                                />
                              )}
                              {session.duration && (
                                <Chip
                                  label={`${Math.floor(session.duration / 60)}m`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {session.ai_summary && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Summary
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {session.ai_summary}
                            </Typography>
                          </Box>
                        )}
                        
                        {session.identified_patterns && session.identified_patterns.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Identified Patterns
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {session.identified_patterns.map((pattern, idx) => (
                                <Chip key={idx} label={pattern} size="small" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {session.learning_changes && (() => {
                          try {
                            const changes = JSON.parse(session.learning_changes);
                            if (changes.length > 0) {
                              return (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom color="success.main">
                                    🧠 What I Learned
                                  </Typography>
                                  <Box sx={{ pl: 2 }}>
                                    {changes.map((change: string, idx: number) => (
                                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        • {change}
                                      </Typography>
                                    ))}
                                  </Box>
                                </Box>
                              );
                            }
                          } catch (e) {
                            return null;
                          }
                          return null;
                        })()}
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            size="small"
                            onClick={() => navigate(`/conversation/${session.id}`)}
                          >
                            View Full Session
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => exportSession(session)}
                          >
                            Export
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this session?')) {
                                deleteSessionMutation.mutate(session.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Box>
            ))}
        </Box>
      ) : (
        // Grid view
        <Grid container spacing={2}>
          {filteredSessions
            .sort((a: Session, b: Session) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .map((session: Session) => (
              <Grid item xs={12} sm={6} md={4} key={session.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate(`/conversation/${session.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {getSessionTypeLabel(session.session_type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {format(new Date(session.timestamp), 'PPP')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
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
                    
                    {session.ai_summary && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {session.ai_summary.substring(0, 100)}...
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSession(session);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this session?')) {
                            deleteSessionMutation.mutate(session.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Container>
  );
}