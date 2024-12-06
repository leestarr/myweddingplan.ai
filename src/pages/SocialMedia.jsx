import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAI } from '../hooks/useGoogleAI';
import {
  Card,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  AccessTime as AccessTimeIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

export default function SocialMedia() {
  const { user } = useAuth();
  const { generateContent } = useGoogleAI();
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState({ bride: '', groom: '' });
  const [weddingDetails, setWeddingDetails] = useState({
    date: '',
    venue: '',
    style: '',
  });
  const [generatedContent, setGeneratedContent] = useState({
    hashtags: [],
    captions: [],
    timingTips: [],
    templates: [],
  });

  const generateHashtags = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 10 unique and creative wedding hashtags for ${names.bride} and ${names.groom}'s wedding. 
        The wedding style is ${weddingDetails.style}. Make them fun, memorable, and easy to use.`;
      
      const response = await generateContent(prompt);
      const hashtags = response.split('\\n')
        .filter(tag => tag.trim())
        .map(tag => tag.replace(/[^a-zA-Z0-9]/g, ''));
      
      setGeneratedContent(prev => ({
        ...prev,
        hashtags,
      }));
    } catch (error) {
      console.error('Error generating hashtags:', error);
    }
    setLoading(false);
  };

  const generateCaptions = async () => {
    setLoading(true);
    try {
      const prompt = `Create 5 engaging social media captions for wedding photos. Context:
        - Couple: ${names.bride} & ${names.groom}
        - Date: ${weddingDetails.date}
        - Venue: ${weddingDetails.venue}
        - Style: ${weddingDetails.style}
        Make them emotional, personal, and suitable for Instagram/Facebook.`;
      
      const response = await generateContent(prompt);
      const captions = response.split('\\n\\n').filter(caption => caption.trim());
      
      setGeneratedContent(prev => ({
        ...prev,
        captions,
      }));
    } catch (error) {
      console.error('Error generating captions:', error);
    }
    setLoading(false);
  };

  const generateTimingTips = async () => {
    setLoading(true);
    try {
      const prompt = `Provide 5 specific recommendations for the best moments to take photos during a wedding at ${weddingDetails.venue}. 
        Consider lighting, timing, and special moments. Include both traditional and unique photo opportunities.`;
      
      const response = await generateContent(prompt);
      const tips = response.split('\\n').filter(tip => tip.trim());
      
      setGeneratedContent(prev => ({
        ...prev,
        timingTips: tips,
      }));
    } catch (error) {
      console.error('Error generating timing tips:', error);
    }
    setLoading(false);
  };

  const generateTemplates = async () => {
    setLoading(true);
    try {
      const prompt = `Create 3 social media announcement templates for:
        1. Save the Date
        2. Wedding Day Announcement
        3. Thank You Post
        For ${names.bride} & ${names.groom}'s wedding on ${weddingDetails.date} at ${weddingDetails.venue}.`;
      
      const response = await generateContent(prompt);
      const templates = response.split('\\n\\n').filter(template => template.trim());
      
      setGeneratedContent(prev => ({
        ...prev,
        templates,
      }));
    } catch (error) {
      console.error('Error generating templates:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Typography variant="h4" className="mb-6">
        Social Media Content Generator
      </Typography>

      {/* Input Section */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <TextField
            label="Bride's Name"
            value={names.bride}
            onChange={(e) => setNames({ ...names, bride: e.target.value })}
          />
          <TextField
            label="Groom's Name"
            value={names.groom}
            onChange={(e) => setNames({ ...names, groom: e.target.value })}
          />
          <TextField
            label="Wedding Date"
            value={weddingDetails.date}
            onChange={(e) => setWeddingDetails({ ...weddingDetails, date: e.target.value })}
          />
          <TextField
            label="Venue"
            value={weddingDetails.venue}
            onChange={(e) => setWeddingDetails({ ...weddingDetails, venue: e.target.value })}
          />
          <TextField
            label="Wedding Style"
            value={weddingDetails.style}
            onChange={(e) => setWeddingDetails({ ...weddingDetails, style: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            startIcon={<TagIcon />}
            onClick={generateHashtags}
            disabled={loading}
          >
            Generate Hashtags
          </Button>
          <Button
            variant="contained"
            startIcon={<InstagramIcon />}
            onClick={generateCaptions}
            disabled={loading}
          >
            Generate Captions
          </Button>
          <Button
            variant="contained"
            startIcon={<AccessTimeIcon />}
            onClick={generateTimingTips}
            disabled={loading}
          >
            Photo Timing Tips
          </Button>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            onClick={generateTemplates}
            disabled={loading}
          >
            Generate Templates
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="flex justify-center my-4">
          <CircularProgress />
        </div>
      )}

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hashtags */}
        {generatedContent.hashtags.length > 0 && (
          <Card className="p-6">
            <Typography variant="h6" className="mb-4">
              Wedding Hashtags
            </Typography>
            <div className="flex flex-wrap gap-2">
              {generatedContent.hashtags.map((hashtag, index) => (
                <Chip
                  key={index}
                  label={`#${hashtag}`}
                  onClick={() => copyToClipboard(`#${hashtag}`)}
                  onDelete={() => copyToClipboard(`#${hashtag}`)}
                  deleteIcon={<ContentCopyIcon />}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Captions */}
        {generatedContent.captions.length > 0 && (
          <Card className="p-6">
            <Typography variant="h6" className="mb-4">
              Social Media Captions
            </Typography>
            {generatedContent.captions.map((caption, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <Typography variant="body1">{caption}</Typography>
                  <IconButton onClick={() => copyToClipboard(caption)}>
                    <ContentCopyIcon />
                  </IconButton>
                </div>
                {index < generatedContent.captions.length - 1 && <Divider className="my-2" />}
              </div>
            ))}
          </Card>
        )}

        {/* Timing Tips */}
        {generatedContent.timingTips.length > 0 && (
          <Card className="p-6">
            <Typography variant="h6" className="mb-4">
              Photo Timing Recommendations
            </Typography>
            {generatedContent.timingTips.map((tip, index) => (
              <div key={index} className="mb-2">
                <Typography variant="body1">• {tip}</Typography>
              </div>
            ))}
          </Card>
        )}

        {/* Templates */}
        {generatedContent.templates.length > 0 && (
          <Card className="p-6">
            <Typography variant="h6" className="mb-4">
              Announcement Templates
            </Typography>
            {generatedContent.templates.map((template, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <Typography variant="body1">{template}</Typography>
                  <IconButton onClick={() => copyToClipboard(template)}>
                    <ContentCopyIcon />
                  </IconButton>
                </div>
                {index < generatedContent.templates.length - 1 && <Divider className="my-2" />}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
