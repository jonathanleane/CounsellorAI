import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as JsonIcon,
  TextFields as TextIcon,
  Archive as ZipIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DataExport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleExport = async (format: 'json' | 'text' | 'archive') => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.get(`/export/${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const extension = format === 'archive' ? 'zip' : format;
      link.setAttribute('download', `counsellor-ai-export.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Your data has been exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmation !== 'DELETE_ALL_MY_DATA') {
      setError('Please type the confirmation text exactly');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.delete('/export/delete-all', {
        data: { confirmation: deleteConfirmation }
      });

      setSuccess(response.data.message);
      setDeleteDialogOpen(false);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Export & Privacy
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Download all your data or permanently delete your account. Your privacy is important to us.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Your Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Download all your therapy sessions, profile information, and insights in your preferred format.
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <JsonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="JSON Format"
                secondary="Machine-readable format, perfect for backups or data transfer"
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('json')}
                disabled={loading}
              >
                Export JSON
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <TextIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Text Format"
                secondary="Human-readable format, easy to read and print"
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('text')}
                disabled={loading}
              >
                Export Text
              </Button>
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <ZipIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="ZIP Archive"
                secondary="Complete backup with all sessions organized in folders"
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('archive')}
                disabled={loading}
              >
                Export Archive
              </Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card sx={{ borderColor: 'error.main', borderWidth: 2, borderStyle: 'solid' }}>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Delete All Data
          </Typography>
          <Typography variant="body2" paragraph>
            This will permanently delete all your therapy sessions, profile information, and any data 
            associated with your account. This action cannot be undone.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              Delete All My Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography color="error" variant="h6">
            <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Confirm Data Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            You are about to permanently delete all your data. This includes:
          </DialogContentText>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="All therapy sessions and conversations" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Your profile and preferences" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="AI insights and summaries" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="All personal information" />
            </ListItem>
          </List>

          <Alert severity="error" sx={{ mt: 2 }}>
            This action cannot be undone. Please export your data first if you want to keep a copy.
          </Alert>

          <TextField
            fullWidth
            label="Type DELETE_ALL_MY_DATA to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            sx={{ mt: 2 }}
            error={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE_ALL_MY_DATA'}
            helperText="Please type exactly: DELETE_ALL_MY_DATA"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmation('');
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAll}
            color="error"
            variant="contained"
            disabled={loading || deleteConfirmation !== 'DELETE_ALL_MY_DATA'}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataExport;