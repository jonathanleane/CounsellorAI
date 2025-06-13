import { Typography, Button, Card, CardContent, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '@/stores/profileStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = useProfileStore((state) => state.profile);

  const handleNewConversation = () => {
    // TODO: Create new session and navigate
    navigate('/conversation/new');
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Welcome back, {profile?.name}!
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNewConversation}
          fullWidth
        >
          Start New Conversation
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Sessions
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">
                No recent sessions yet. Start a conversation to begin!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}