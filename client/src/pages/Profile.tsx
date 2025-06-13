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
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((state) => state.setProfile);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
  });

  // Fetch brain data
  const { data: brain } = useQuery({
    queryKey: ['profile', 'brain'],
    queryFn: () => profileApi.getBrain(),
  });

  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    demographics: {
      age: '',
      gender: '',
    },
    spirituality: {
      beliefs: '',
      importance: '',
    },
    therapy_goals: {
      primary_goal: '',
      secondary_goals: '',
    },
    preferences: {
      communication_style: '',
      approach: '',
    },
    health: {
      physical_conditions: '',
      medications: '',
    },
    mental_health_screening: {
      previous_therapy: '',
      current_challenges: '',
    },
    sensitive_topics: {
      avoid_topics: '',
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile?.data) {
      setFormData(profile.data);
    }
  }, [profile?.data]);

  // Update brain mutation
  const updateBrainMutation = useMutation({
    mutationFn: ({ category, field, value }: any) =>
      profileApi.updateBrain(category, field, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'brain'] });
      setSnackbar({ open: true, message: 'Brain data updated successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update brain data', severity: 'error' });
    },
  });

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would update the profile via API
    setEditMode(false);
    setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Your Profile</Typography>
        <Button
          variant={editMode ? 'contained' : 'outlined'}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
        >
          {editMode ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<PersonIcon />} label="Basic Information" />
          <Tab icon={<PsychologyIcon />} label="Therapy Goals" />
          <Tab icon={<SettingsIcon />} label="Preferences" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Age"
                    type="number"
                    value={formData.demographics.age}
                    onChange={(e) => updateFormData('demographics', 'age', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <FormControl fullWidth disabled={!editMode}>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      value={formData.demographics.gender}
                      onChange={(e) => updateFormData('demographics', 'gender', e.target.value)}
                    >
                      <MenuItem value="">Prefer not to say</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="non-binary">Non-binary</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Physical Conditions"
                    value={formData.health.physical_conditions}
                    onChange={(e) => updateFormData('health', 'physical_conditions', e.target.value)}
                    disabled={!editMode}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Current Medications"
                    value={formData.health.medications}
                    onChange={(e) => updateFormData('health', 'medications', e.target.value)}
                    disabled={!editMode}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Therapy Goals
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Primary Goal"
                    value={formData.therapy_goals.primary_goal}
                    onChange={(e) => updateFormData('therapy_goals', 'primary_goal', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Secondary Goals"
                    value={formData.therapy_goals.secondary_goals}
                    onChange={(e) => updateFormData('therapy_goals', 'secondary_goals', e.target.value)}
                    disabled={!editMode}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Current Challenges"
                    value={formData.mental_health_screening.current_challenges}
                    onChange={(e) => updateFormData('mental_health_screening', 'current_challenges', e.target.value)}
                    disabled={!editMode}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Therapist Brain Insights
                </Typography>
                {brain?.data?.insights ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(brain.data.insights).map(([key, value]: [string, any]) => (
                      <Box key={key}>
                        <Typography variant="subtitle2" color="primary">
                          {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No insights available yet. Start having conversations to build your therapist's understanding of you.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Communication Preferences
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth disabled={!editMode}>
                    <FormLabel>Communication Style</FormLabel>
                    <Select
                      value={formData.preferences.communication_style}
                      onChange={(e) => updateFormData('preferences', 'communication_style', e.target.value)}
                    >
                      <MenuItem value="">No preference</MenuItem>
                      <MenuItem value="direct">Direct and straightforward</MenuItem>
                      <MenuItem value="gentle">Gentle and supportive</MenuItem>
                      <MenuItem value="analytical">Analytical and detailed</MenuItem>
                      <MenuItem value="casual">Casual and conversational</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth disabled={!editMode}>
                    <FormLabel>Therapy Approach</FormLabel>
                    <Select
                      value={formData.preferences.approach}
                      onChange={(e) => updateFormData('preferences', 'approach', e.target.value)}
                    >
                      <MenuItem value="">No preference</MenuItem>
                      <MenuItem value="cbt">Cognitive Behavioral Therapy</MenuItem>
                      <MenuItem value="mindfulness">Mindfulness-based</MenuItem>
                      <MenuItem value="psychodynamic">Psychodynamic</MenuItem>
                      <MenuItem value="solution-focused">Solution-focused</MenuItem>
                      <MenuItem value="integrative">Integrative</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sensitive Topics
                </Typography>
                <TextField
                  label="Topics to Avoid"
                  value={formData.sensitive_topics.avoid_topics}
                  onChange={(e) => updateFormData('sensitive_topics', 'avoid_topics', e.target.value)}
                  disabled={!editMode}
                  multiline
                  rows={4}
                  fullWidth
                  helperText="List any topics you'd prefer not to discuss"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Session Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.data?.stats?.total_sessions || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sessions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.data?.stats?.avg_mood || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Mood
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.data?.stats?.total_duration ? 
                          `${Math.floor(profile.data.stats.total_duration / 60)}h` : '0h'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profile?.data?.stats?.streak || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Day Streak
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}