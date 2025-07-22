import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome,
  Palette,
  Psychology,
  Token,
  MonetizationOn,
  Lightbulb,
  Collections,
  CameraAlt,
  Mic,
  Star,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const AIFeaturesPage = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'AI Paintscheme Recommendations',
      description:
        'Generate custom paintschemes from natural language descriptions. Get color palettes, techniques, and visual examples.',
      icon: <Palette />,
      status: 'planned',
      tokenCost: 10,
    },
    {
      title: 'AI Nickname Generation',
      description:
        'Creative nickname suggestions for models and collections based on themes and personality traits.',
      icon: <Psychology />,
      status: 'planned',
      tokenCost: 3,
    },
    {
      title: 'Token Economy System',
      description:
        'Fair token-based pricing for AI features with flexible packages and daily free allowances.',
      icon: <Token />,
      status: 'planned',
      tokenCost: 0,
    },
    {
      title: 'AI-Powered Color Analysis',
      description:
        'Use camera to analyze colors and get AI recommendations for matching paintschemes.',
      icon: <CameraAlt />,
      status: 'planned',
      tokenCost: 5,
    },
    {
      title: 'Voice Paintscheme Descriptions',
      description:
        'Describe your vision using voice input for natural AI paintscheme generation.',
      icon: <Mic />,
      status: 'planned',
      tokenCost: 10,
    },
    {
      title: 'Community AI Sharing',
      description:
        'Share and discover AI-generated paintschemes and nicknames with the community.',
      icon: <Star />,
      status: 'planned',
      tokenCost: 0,
    },
  ];

  const tokenPackages = [
    {
      name: 'Starter Pack',
      price: '$5',
      tokens: 100,
      value: '20 paintschemes or 33 nicknames',
      popular: false,
    },
    {
      name: 'Hobbyist Pack',
      price: '$15',
      tokens: 350,
      value: '35 paintschemes or 116 nicknames',
      popular: true,
    },
    {
      name: 'Pro Pack',
      price: '$40',
      tokens: 1000,
      value: '100 paintschemes or 333 nicknames',
      popular: false,
    },
  ];

  const mockAIExamples = [
    {
      type: 'Paintscheme',
      input: '"Dark gothic cathedral with gold accents"',
      output:
        'Deep purple base with Balthasar Gold trim, Nuln Oil wash, edge highlighting with Screamer Pink',
      tokens: 10,
    },
    {
      type: 'Nickname',
      input: 'Space Marine Captain with thunder hammer',
      output: 'Stormbringer Vex, The Thunder Lord, Captain Ironwill',
      tokens: 3,
    },
    {
      type: 'Collection Name',
      input: 'Necron army with Egyptian theme',
      output:
        "Dynasty of the Eternal Sands, Pharaoh's Awakening, The Silent Throne",
      tokens: 3,
    },
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label='Complete' color='success' size='small' />;
      case 'in-progress':
        return <Chip label='In Progress' color='warning' size='small' />;
      case 'planned':
      default:
        return <Chip label='Coming Soon' color='default' size='small' />;
    }
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AutoAwesome sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            AI Features & Tokens
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Enhance your hobby with AI-powered paintscheme recommendations,
          creative nicknames, and intelligent assistance
        </Typography>

        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: 1,
            borderColor: 'primary.main',
          }}
        >
          <Typography variant='body1' sx={{ mb: 2 }}>
            <strong>🤖 AI-Powered Future</strong> - Revolutionary AI features
            are in development to transform your hobby experience with
            intelligent recommendations and creative assistance!
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/72'
              target='_blank'
              rel='noopener'
            >
              Issue #72
            </Link>{' '}
            for development progress and technical details.
          </Typography>
        </Paper>
      </Box>

      {/* Token Balance Preview */}
      <Card sx={{ mb: 4, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Token sx={{ mr: 2, color: 'warning.main' }} />
            <Typography variant='h5'>Your AI Tokens</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box>
              <Typography variant='h3' color='warning.main'>
                250
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Current Balance
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Daily Free Tokens
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant='determinate'
                  value={60}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant='body2'>3/5</Typography>
              </Box>
            </Box>
            <Button variant='contained' startIcon={<MonetizationOn />}>
              Buy Tokens
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          AI Features
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          {features.map((feature, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>{feature.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant='h6' sx={{ flexGrow: 1 }}>
                        {feature.title}
                      </Typography>
                      {getStatusChip(feature.status)}
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {feature.description}
                    </Typography>
                    {feature.tokenCost > 0 && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Token sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant='caption' color='warning.main'>
                          {feature.tokenCost} tokens per use
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* AI Examples Preview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              AI Examples Preview
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Here's what AI-generated content will look like:
            </Typography>

            <Stack spacing={2}>
              {mockAIExamples.map((example, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={example.type}
                      size='small'
                      color='primary'
                      sx={{ mr: 1 }}
                    />
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Token sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant='caption' color='warning.main'>
                        {example.tokens}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>Input:</strong> {example.input}
                  </Typography>
                  <Typography variant='body2' color='success.main'>
                    <strong>AI Output:</strong> {example.output}
                  </Typography>
                  {index < mockAIExamples.length - 1 && (
                    <Box
                      sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Token Packages
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Choose the perfect token package for your needs:
            </Typography>

            <Stack spacing={2}>
              {tokenPackages.map((pkg, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: pkg.popular ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: pkg.popular
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'transparent',
                    position: 'relative',
                  }}
                >
                  {pkg.popular && (
                    <Chip
                      label='Most Popular'
                      color='primary'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 8,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {pkg.name}
                  </Typography>
                  <Typography variant='h6' color='primary.main'>
                    {pkg.price}
                  </Typography>
                  <Typography variant='body2'>{pkg.tokens} tokens</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {pkg.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Lightbulb sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant='h5' gutterBottom>
            AI Revolution Coming Soon!
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Get ready for the future of hobby management with AI-powered
            creativity tools. Be among the first to experience intelligent
            paintscheme recommendations and creative assistance.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={Link}
              to='/models'
              variant='contained'
              startIcon={<Collections />}
            >
              Browse Models
            </Button>
            <Button component={Link} to='/dashboard' variant='outlined'>
              Back to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
