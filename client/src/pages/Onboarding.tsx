import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormLabel,
  LinearProgress,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';

const steps = [
  'Basic Information',
  'Goals & Preferences',
  'Health Information',
  'Mental Health',
  'Review',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setProfile = useProfileStore((state) => state.setProfile);
  const [activeStep, setActiveStep] = useState(0);
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

  const queryClient = useQueryClient();
  
  const createProfileMutation = useMutation({
    mutationFn: profileApi.create,
    onSuccess: (response) => {
      console.log('Profile created successfully:', response.data);
      setProfile(response.data);
      // Invalidate the profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Navigate using React Router
      navigate('/');
    },
    onError: (error: any) => {
      console.error('Profile creation failed:', error);
      console.error('Error details:', error.response?.data);
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit the form
      console.log('Submitting profile data:', formData);
      createProfileMutation.mutate(formData);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const updateTopLevelField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Information
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="What's your name?"
              value={formData.name}
              onChange={(e) => updateTopLevelField('name', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Age (optional)"
              type="number"
              value={formData.demographics.age}
              onChange={(e) => updateFormData('demographics', 'age', e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <FormLabel>Gender (optional)</FormLabel>
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
        );

      case 1: // Goals & Preferences
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="What's your primary goal?"
              value={formData.therapy_goals.primary_goal}
              onChange={(e) => updateFormData('therapy_goals', 'primary_goal', e.target.value)}
              placeholder="e.g., Reduce anxiety, Improve relationships"
              required
              fullWidth
            />
            <TextField
              label="Any other goals? (optional)"
              value={formData.therapy_goals.secondary_goals}
              onChange={(e) => updateFormData('therapy_goals', 'secondary_goals', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <FormLabel>Preferred communication style</FormLabel>
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
          </Box>
        );

      case 2: // Health Information
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Any physical health conditions? (optional)"
              value={formData.health.physical_conditions}
              onChange={(e) => updateFormData('health', 'physical_conditions', e.target.value)}
              placeholder="e.g., Chronic pain, diabetes, etc."
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Current medications? (optional)"
              value={formData.health.medications}
              onChange={(e) => updateFormData('health', 'medications', e.target.value)}
              placeholder="List any medications you're taking"
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        );

      case 3: // Mental Health
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <FormLabel>Have you been to therapy before?</FormLabel>
              <Select
                value={formData.mental_health_screening.previous_therapy}
                onChange={(e) => updateFormData('mental_health_screening', 'previous_therapy', e.target.value)}
              >
                <MenuItem value="">Prefer not to say</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="What challenges are you currently facing?"
              value={formData.mental_health_screening.current_challenges}
              onChange={(e) => updateFormData('mental_health_screening', 'current_challenges', e.target.value)}
              placeholder="e.g., Anxiety, depression, stress, relationships"
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Any topics you'd prefer to avoid? (optional)"
              value={formData.sensitive_topics.avoid_topics}
              onChange={(e) => updateFormData('sensitive_topics', 'avoid_topics', e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        );

      case 4: // Review
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Review Your Information</Typography>
            <Typography variant="body2" color="text.secondary">
              Please review your information before proceeding.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Name: {formData.name}</Typography>
              <Typography variant="subtitle2" gutterBottom>
                Primary Goal: {formData.therapy_goals.primary_goal}
              </Typography>
              {formData.demographics.age && (
                <Typography variant="subtitle2" gutterBottom>
                  Age: {formData.demographics.age}
                </Typography>
              )}
              {formData.mental_health_screening.current_challenges && (
                <Typography variant="subtitle2" gutterBottom>
                  Current Challenges: {formData.mental_health_screening.current_challenges}
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" sx={{ mt: 2 }}>
              By clicking "Complete Setup", you agree to start your therapy journey with our AI therapist.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.name.trim() !== '';
      case 1:
        return formData.therapy_goals.primary_goal.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to CounsellorAI
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Let's set up your profile to personalize your experience
          </Typography>

          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <LinearProgress
            variant="determinate"
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ mb: 4 }}
          />

          <Box sx={{ minHeight: 300 }}>{renderStepContent()}</Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid() || createProfileMutation.isPending}
            >
              {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </Button>
          </Box>

          {createProfileMutation.isError && (
            <Box sx={{ mt: 2 }}>
              <Typography color="error" align="center">
                Failed to create profile. Please try again.
              </Typography>
              <Typography variant="caption" color="error" align="center" display="block">
                {(createProfileMutation.error as any)?.response?.data?.error?.message || 
                 (createProfileMutation.error as any)?.message || 
                 'Unknown error occurred'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}