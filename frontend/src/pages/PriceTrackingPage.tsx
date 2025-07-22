import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  NotificationsActive,
  BarChart,
  Store,
  Schedule,
  Collections,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const PriceTrackingPage = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Price Display in Model Details',
      description:
        'View current prices for models directly in their detail pages',
      icon: <AttachMoney />,
      status: 'planned',
    },
    {
      title: 'Price History Charts',
      description: 'Interactive charts showing price trends over time',
      icon: <BarChart />,
      status: 'planned',
    },
    {
      title: 'Price Alert Setup',
      description: 'Set custom price alerts and get notified when prices drop',
      icon: <NotificationsActive />,
      status: 'planned',
    },
    {
      title: 'Price Comparison View',
      description: 'Compare prices across multiple retailers side by side',
      icon: <TrendingUp />,
      status: 'planned',
    },
    {
      title: 'Retailer Links',
      description: 'Direct links to purchase models from various retailers',
      icon: <Store />,
      status: 'planned',
    },
  ];

  const retailers = [
    'Games Workshop',
    'Amazon',
    'Element Games',
    'Dicehead Games',
    'Triple Helix Wargames',
    'Wayland Games',
  ];

  const mockPriceData = [
    {
      model: 'Space Marine Intercessors',
      currentPrice: '£35.00',
      previousPrice: '£40.00',
      discount: '12%',
      retailer: 'Element Games',
    },
    {
      model: 'Necron Warriors',
      currentPrice: '£28.50',
      previousPrice: '£30.00',
      discount: '5%',
      retailer: 'Wayland Games',
    },
    {
      model: 'Imperial Knight',
      currentPrice: '£115.00',
      previousPrice: '£120.00',
      discount: '4%',
      retailer: 'Triple Helix',
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
          <TrendingUp sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            Price Tracking
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Track Warhammer model prices across multiple retailers and never miss
          a deal
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
            <strong>🚧 Under Development</strong> - This feature is currently
            being developed as part of our mobile interface enhancement. Price
            tracking will be available in a future update!
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/33'
              target='_blank'
              rel='noopener'
            >
              Issue #33
            </Link>{' '}
            for development progress and technical details.
          </Typography>
        </Paper>
      </Box>

      {/* Feature Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Planned Features
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
                    <Typography variant='body2' color='text.secondary'>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Mock Price Data Preview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              Price Tracking Preview
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Here's what price tracking will look like when implemented:
            </Typography>

            <List>
              {mockPriceData.map((item, index) => (
                <ListItem
                  key={index}
                  divider={index < mockPriceData.length - 1}
                >
                  <ListItemIcon>
                    <TrendingUp color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.model}
                    secondary={`${item.retailer} • ${item.discount} off`}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='h6' color='success.main'>
                      {item.currentPrice}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                      }}
                    >
                      {item.previousPrice}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Supported Retailers
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              We plan to track prices from these retailers:
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {retailers.map((retailer, index) => (
                <Chip
                  key={index}
                  label={retailer}
                  variant='outlined'
                  size='small'
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Schedule sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant='h5' gutterBottom>
            Stay Tuned!
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Price tracking features are coming soon. In the meantime, explore
            your collection and keep track of your models manually.
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
