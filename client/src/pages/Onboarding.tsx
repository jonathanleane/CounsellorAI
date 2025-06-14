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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
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

// Common options for checkboxes
const COMMON_GOALS = [
  'Reduce anxiety',
  'Manage depression',
  'Improve relationships',
  'Build self-esteem',
  'Manage stress',
  'Process grief/loss',
  'Handle life transitions',
  'Improve work-life balance',
  'Develop coping skills',
  'Heal from trauma',
];

const COMMON_HEALTH_CONDITIONS = [
  'Chronic pain',
  'Sleep issues',
  'Digestive problems',
  'Headaches/migraines',
  'High blood pressure',
  'Diabetes',
  'Heart condition',
  'Autoimmune condition',
  'None of the above',
];

const COMMON_MENTAL_HEALTH = [
  'Anxiety',
  'Depression',
  'ADHD',
  'PTSD',
  'Bipolar disorder',
  'OCD',
  'Eating disorder',
  'Substance use',
  'No previous diagnosis',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setProfile = useProfileStore((state) => state.setProfile);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>([]);
  const [selectedMentalHealth, setSelectedMentalHealth] = useState<string[]>([]);
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
      previous_diagnosis: '',
      current_medications: '',
      therapy_history: '',
    },
    sensitive_topics: {
      avoid_topics: '',
    },
  });

  const queryClient = useQueryClient();
  
  const createProfileMutation = useMutation({
    mutationFn: profileApi.create,
    onSuccess: async (response) => {
      console.log('Profile created successfully:', response.data);
      setProfile(response.data);
      // Invalidate the profile query to trigger a refetch and wait for it
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
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
      // Combine checkbox selections with text fields
      const finalFormData = {
        ...formData,
        therapy_goals: {
          primary_goal: selectedGoals.length > 0 ? selectedGoals.join(', ') : formData.therapy_goals.primary_goal,
          secondary_goals: formData.therapy_goals.secondary_goals,
        },
        health: {
          physical_conditions: selectedHealthConditions.filter(c => c !== 'None of the above').join(', ') || formData.health.physical_conditions,
          medications: formData.health.medications,
        },
        mental_health_screening: {
          previous_diagnosis: selectedMentalHealth.filter(c => c !== 'No previous diagnosis').join(', ') || formData.mental_health_screening.previous_diagnosis,
          current_medications: formData.mental_health_screening.current_medications,
          therapy_history: formData.mental_health_screening.therapy_history,
        },
      };
      console.log('Submitting profile data:', finalFormData);
      createProfileMutation.mutate(finalFormData);
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
        ...(prev[section as keyof typeof prev] as any),
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
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                What would you like to work on? (Select all that apply)
              </Typography>
              <FormGroup>
                {COMMON_GOALS.map((goal) => (
                  <FormControlLabel
                    key={goal}
                    control={
                      <Checkbox
                        checked={selectedGoals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGoals([...selectedGoals, goal]);
                          } else {
                            setSelectedGoals(selectedGoals.filter(g => g !== goal));
                          }
                        }}
                      />
                    }
                    label={goal}
                  />
                ))}
              </FormGroup>
              <TextField
                label="Other goals not listed above"
                value={formData.therapy_goals.primary_goal}
                onChange={(e) => updateFormData('therapy_goals', 'primary_goal', e.target.value)}
                placeholder="Tell us more about what you'd like to work on"
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </Box>
            <TextField
              label="Any additional context? (optional)"
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
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Do you have any of these health conditions? (Select all that apply)
              </Typography>
              <FormGroup>
                {COMMON_HEALTH_CONDITIONS.map((condition) => (
                  <FormControlLabel
                    key={condition}
                    control={
                      <Checkbox
                        checked={selectedHealthConditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (condition === 'None of the above') {
                              setSelectedHealthConditions(['None of the above']);
                            } else {
                              setSelectedHealthConditions([
                                ...selectedHealthConditions.filter(c => c !== 'None of the above'), 
                                condition
                              ]);
                            }
                          } else {
                            setSelectedHealthConditions(selectedHealthConditions.filter(c => c !== condition));
                          }
                        }}
                      />
                    }
                    label={condition}
                  />
                ))}
              </FormGroup>
              <TextField
                label="Other health conditions not listed"
                value={formData.health.physical_conditions}
                onChange={(e) => updateFormData('health', 'physical_conditions', e.target.value)}
                placeholder="Please describe any other health conditions"
                multiline
                rows={2}
                fullWidth
                sx={{ mt: 2 }}
              />
            </Box>
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
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Have you experienced any of these? (Select all that apply)
              </Typography>
              <FormGroup>
                {COMMON_MENTAL_HEALTH.map((condition) => (
                  <FormControlLabel
                    key={condition}
                    control={
                      <Checkbox
                        checked={selectedMentalHealth.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (condition === 'No previous diagnosis') {
                              setSelectedMentalHealth(['No previous diagnosis']);
                            } else {
                              setSelectedMentalHealth([
                                ...selectedMentalHealth.filter(c => c !== 'No previous diagnosis'), 
                                condition
                              ]);
                            }
                          } else {
                            setSelectedMentalHealth(selectedMentalHealth.filter(c => c !== condition));
                          }
                        }}
                      />
                    }
                    label={condition}
                  />
                ))}
              </FormGroup>
            </Box>
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
              label="What else would you like us to know? (optional)"
              value={formData.mental_health_screening.current_challenges}
              onChange={(e) => updateFormData('mental_health_screening', 'current_challenges', e.target.value)}
              placeholder="Share any additional context about your mental health journey"
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
              <Typography variant="subtitle2" gutterBottom>
                <strong>Name:</strong> {formData.name}
              </Typography>
              
              {selectedGoals.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom><strong>Goals:</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedGoals.map((goal) => (
                      <Chip key={goal} label={goal} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedHealthConditions.length > 0 && selectedHealthConditions[0] !== 'None of the above' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom><strong>Health Conditions:</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedHealthConditions.map((condition) => (
                      <Chip key={condition} label={condition} size="small" color="secondary" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedMentalHealth.length > 0 && selectedMentalHealth[0] !== 'No previous diagnosis' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom><strong>Mental Health:</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMentalHealth.map((condition) => (
                      <Chip key={condition} label={condition} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {formData.demographics.age && (
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Age:</strong> {formData.demographics.age}
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
        // Valid if either checkboxes are selected OR text is entered
        return selectedGoals.length > 0 || formData.therapy_goals.primary_goal.trim() !== '';
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