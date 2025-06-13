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
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  // Fetch profile data
  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('Fetching profile data...');
      try {
        const response = await profileApi.get();
        console.log('Profile API response:', response);
        console.log('Profile data:', response.data);
        return response.data; // Extract the data from axios response
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
  });

  // Fetch brain data
  const { data: brain } = useQuery({
    queryKey: ['profile', 'brain'],
    queryFn: async () => {
      console.log('Fetching brain data...');
      try {
        const response = await profileApi.getBrain();
        console.log('Brain API response:', response);
        console.log('Brain data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching brain:', error);
        throw error;
      }
    },
  });

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('/api/health/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      if (data.models) {
        const availableModelsList = data.models.filter((m: any) => m.available);
        setAvailableModels(availableModelsList);
      }
      return data;
    },
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
      ai_model: '',
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
    console.log('useEffect - profileResponse:', profileResponse);
    
    if (profileResponse) {
      // Parse JSON fields if they're strings
      const profileData = profileResponse;
      console.log('Setting form data with profileData:', profileData);
      
      // Also update the profile store
      setProfile(profileData);
      
      setFormData({
        name: profileData.name || '',
        demographics: typeof profileData.demographics === 'string' 
          ? JSON.parse(profileData.demographics) 
          : profileData.demographics || { age: '', gender: '' },
        spirituality: typeof profileData.spirituality === 'string'
          ? JSON.parse(profileData.spirituality)
          : profileData.spirituality || { beliefs: '', importance: '' },
        therapy_goals: typeof profileData.therapy_goals === 'string'
          ? JSON.parse(profileData.therapy_goals)
          : profileData.therapy_goals || { primary_goal: '', secondary_goals: '' },
        preferences: typeof profileData.preferences === 'string'
          ? JSON.parse(profileData.preferences)
          : profileData.preferences || { communication_style: '', approach: '', ai_model: '' },
        health: typeof profileData.health === 'string'
          ? JSON.parse(profileData.health)
          : profileData.health || { physical_conditions: '', medications: '' },
        mental_health_screening: typeof profileData.mental_health_screening === 'string'
          ? JSON.parse(profileData.mental_health_screening)
          : profileData.mental_health_screening || { previous_therapy: '', current_challenges: '' },
        sensitive_topics: typeof profileData.sensitive_topics === 'string'
          ? JSON.parse(profileData.sensitive_topics)
          : profileData.sensitive_topics || { avoid_topics: '' },
      });
    }
  }, [profileResponse]);

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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditMode(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
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

  if (error) {
    console.error('Profile loading error:', error);
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading profile: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  console.log('Profile component render - profileResponse:', profileResponse);
  console.log('Profile component render - formData:', formData);

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
                {(() => {
                  console.log('Brain data in render:', brain);
                  console.log('Personal details:', brain?.personalDetails);
                  return brain?.personalDetails && Object.keys(brain.personalDetails).length > 0;
                })() ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(brain.personalDetails).map(([category, fields]: [string, any]) => (
                      <Box key={category}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                          {category.replace(/_/g, ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Typography>
                        {typeof fields === 'object' && fields !== null ? (
                          <Box sx={{ pl: 2 }}>
                            {Object.entries(fields).map(([field, value]: [string, any]) => (
                              <Box key={field} sx={{ mb: 0.5 }}>
                                <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                                  {field.replace(/_/g, ' ')}: 
                                </Typography>
                                <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {String(fields)}
                          </Typography>
                        )}
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
                  <FormControl fullWidth disabled={!editMode}>
                    <FormLabel>AI Model Preference</FormLabel>
                    <Select
                      value={formData.preferences.ai_model || ''}
                      onChange={(e) => updateFormData('preferences', 'ai_model', e.target.value)}
                    >
                      <MenuItem value="">Default (Auto-select)</MenuItem>
                      {availableModels.map((model) => (
                        <MenuItem key={model.model} value={model.model}>
                          {model.name}
                        </MenuItem>
                      ))}
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
                        {(() => {
                          console.log('Stats - profileResponse?.stats:', profileResponse?.stats);
                          return profileResponse?.stats?.total_sessions || 0;
                        })()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sessions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profileResponse?.stats?.avg_mood || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Mood
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profileResponse?.stats?.total_duration ? 
                          `${Math.floor(profileResponse.stats.total_duration / 60)}h` : '0h'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {profileResponse?.stats?.streak || 0}
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