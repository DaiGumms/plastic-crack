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
  Divider,
  Badge,
} from '@mui/material';
import {
  BookmarkBorder,
  ShoppingCart,
  AttachMoney,
  Collections,
  Share,
  Star,
  LocalOffer,
} from '@mui/icons-material';
import { Link } from 'react-router';

export const WishlistSystemPage = () => {
  const theme = useTheme();

  const userBenefits = [
    {
      title: 'Track Your Dream Models',
      description:
        'Create multiple wishlists to organize models by priority, collection, or occasion.',
      icon: <BookmarkBorder />,
      userType: 'collectors',
      benefit: 'Never lose track of what you want',
    },
    {
      title: 'Smart Budget Planning',
      description:
        'Set target prices, track costs, and get recommendations on when to buy.',
      icon: <AttachMoney />,
      userType: 'budget-conscious',
      benefit: 'Save money with intelligent planning',
    },
    {
      title: 'Collection Integration',
      description:
        'See planned models in your collections and track completion progress.',
      icon: <Collections />,
      userType: 'organizers',
      benefit: 'Visualize your complete collection',
    },
    {
      title: 'Share Gift Lists',
      description:
        'Share wishlists with friends and family for holidays and special occasions.',
      icon: <Share />,
      userType: 'social',
      benefit: 'Get the perfect gifts every time',
    },
    {
      title: 'Purchase Tracking',
      description:
        'Record purchases, track spending, and convert wishlist items to owned models.',
      icon: <ShoppingCart />,
      userType: 'all users',
      benefit: 'Complete purchase history at your fingertips',
    },
    {
      title: 'Deal Alerts',
      description:
        'Get notified when wishlist items go on sale or reach your target price.',
      icon: <LocalOffer />,
      userType: 'deal hunters',
      benefit: 'Never miss a great deal again',
    },
  ];

  const mockWishlists = [
    {
      name: 'Next Purchase',
      itemCount: 12,
      totalCost: 347.5,
      budget: 400.0,
      priority: 'High',
      shared: false,
      updated: '2 days ago',
      color: 'error' as const,
    },
    {
      name: 'Holiday List',
      itemCount: 8,
      totalCost: 189.99,
      budget: 250.0,
      priority: 'Medium',
      shared: true,
      updated: '1 week ago',
      color: 'warning' as const,
    },
    {
      name: 'Dream Army',
      itemCount: 24,
      totalCost: 1247.89,
      budget: 1500.0,
      priority: 'Low',
      shared: false,
      updated: '3 weeks ago',
      color: 'info' as const,
    },
  ];

  const features = [
    {
      title: 'Multiple Wishlists',
      description:
        'Create unlimited wishlists for different occasions, priorities, or collections.',
      icon: <BookmarkBorder />,
      status: 'planned',
      highlight: 'Organize your wants perfectly',
    },
    {
      title: 'Budget Planning',
      description:
        'Set budgets, track spending, and get smart purchase recommendations.',
      icon: <AttachMoney />,
      status: 'planned',
      highlight: 'Make every dollar count',
    },
    {
      title: 'Collection Integration',
      description:
        'Add planned models to collections and track completion progress.',
      icon: <Collections />,
      status: 'planned',
      highlight: 'See your complete collection vision',
    },
    {
      title: 'Priority Management',
      description:
        'Set priority levels and get recommendations on what to buy next.',
      icon: <Star />,
      status: 'planned',
      highlight: 'Buy smart, not just often',
    },
    {
      title: 'Purchase Tracking',
      description:
        'Record purchases with dates, prices, and automatic collection updates.',
      icon: <ShoppingCart />,
      status: 'planned',
      highlight: 'Complete purchase history',
    },
    {
      title: 'Social Sharing',
      description:
        'Share wishlists as gift lists or get recommendations from friends.',
      icon: <Share />,
      status: 'planned',
      highlight: 'Perfect for gift-giving',
    },
  ];

  const mockWishlistItems = [
    {
      name: 'Space Marine Captain',
      faction: 'Space Marines',
      targetPrice: 30.0,
      currentPrice: 32.5,
      priority: 'High',
      added: '3 days ago',
      notes: 'Need for tournament army',
    },
    {
      name: 'Tactical Squad (5)',
      faction: 'Space Marines',
      targetPrice: 50.0,
      currentPrice: 55.0,
      priority: 'Medium',
      added: '1 week ago',
      notes: 'Core troops for battalion',
    },
    {
      name: 'Imperial Knight',
      faction: 'Imperial Knights',
      targetPrice: 140.0,
      currentPrice: 165.0,
      priority: 'Low',
      added: '2 weeks ago',
      notes: 'Dream centerpiece model',
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

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'collectors':
        return 'primary';
      case 'budget-conscious':
        return 'success';
      case 'organizers':
        return 'info';
      case 'social':
        return 'secondary';
      case 'deal hunters':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BookmarkBorder sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant='h3' component='h1'>
            Wishlist System
          </Typography>
          <Chip
            label='Coming Soon'
            color='primary'
            variant='outlined'
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
          Smart wishlist management with budget planning, collection
          integration, and purchase tracking
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
            <strong>📋 Smart Collecting</strong> - The ultimate wishlist system
            is in development! Plan purchases, track budgets, and never lose
            sight of your dream models again.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            See{' '}
            <Link
              to='https://github.com/DaiGumms/plastic-crack/issues/66'
              target='_blank'
              rel='noopener'
            >
              Issue #66
            </Link>{' '}
            for development progress and technical details.
          </Typography>
        </Paper>
      </Box>

      {/* Featured Wishlists */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Your Wishlists Preview
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {mockWishlists.map((wishlist, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BookmarkBorder
                    sx={{ mr: 1.5, color: `${wishlist.color}.main` }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='h6'>{wishlist.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {wishlist.itemCount} items • Updated {wishlist.updated}
                    </Typography>
                  </Box>
                  {wishlist.shared && (
                    <Badge
                      badgeContent={<Share sx={{ fontSize: 12 }} />}
                      color='info'
                    >
                      <Box />
                    </Badge>
                  )}
                </Box>

                <Stack spacing={1.5}>
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='body2'>Total Cost</Typography>
                      <Typography variant='body2' fontWeight='bold'>
                        ${wishlist.totalCost.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(wishlist.totalCost / wishlist.budget) * 100}
                      color={wishlist.color}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      Budget: ${wishlist.budget.toFixed(2)}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${wishlist.priority} Priority`}
                    size='small'
                    color={getPriorityColor(wishlist.priority)}
                    variant='outlined'
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* User Benefits */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          How Wishlists Will Transform Your Collecting
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
          {userBenefits.map((benefit, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>{benefit.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant='h6' sx={{ flexGrow: 1 }}>
                        {benefit.title}
                      </Typography>
                      <Chip
                        label={benefit.userType}
                        size='small'
                        color={getUserTypeColor(benefit.userType)}
                        variant='outlined'
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {benefit.description}
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 1,
                        border: 1,
                        borderColor: alpha(theme.palette.success.main, 0.3),
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='success.dark'
                        fontWeight='medium'
                      >
                        📋 {benefit.benefit}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Wishlist Items Preview & Budget Tracking */}
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
              Wishlist Items Preview
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              See how your wishlist management will look:
            </Typography>

            <Stack spacing={2}>
              {mockWishlistItems.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.priority}
                      size='small'
                      color={getPriorityColor(item.priority)}
                    />
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    <strong>Target:</strong> ${item.targetPrice.toFixed(2)} |
                    <strong> Current:</strong> ${item.currentPrice.toFixed(2)}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}
                  >
                    <Chip
                      label={item.faction}
                      size='small'
                      variant='outlined'
                    />
                    <Chip
                      label={`Added ${item.added}`}
                      size='small'
                      color='info'
                    />
                  </Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontStyle: 'italic' }}
                  >
                    📝 {item.notes}
                  </Typography>
                  {index < mockWishlistItems.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Budget Dashboard
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Smart spending insights:
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='primary.main'>
                  $237
                </Typography>
                <Typography variant='body2'>Monthly Budget</Typography>
                <LinearProgress
                  variant='determinate'
                  value={68}
                  color='primary'
                  sx={{ mt: 1 }}
                />
                <Typography variant='caption' color='text.secondary'>
                  $161 spent this month
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='success.main'>
                  3
                </Typography>
                <Typography variant='body2'>
                  Items Under Target Price
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant='h3' color='warning.main'>
                  12
                </Typography>
                <Typography variant='body2'>Total Wishlist Items</Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  borderRadius: 1,
                }}
              >
                <Typography variant='subtitle2' color='info.dark' gutterBottom>
                  💡 Smart Recommendation
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Space Marine Captain is 15% off this week - perfect time to
                  buy!
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Platform Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Wishlist System Features
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
                    <Typography
                      variant='caption'
                      color='primary.main'
                      fontWeight='bold'
                    >
                      {feature.highlight}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Implementation Phases */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ mb: 2 }}>
          Development Roadmap
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {[
            {
              phase: 'Phase 1',
              title: 'Core Wishlists',
              features: ['Basic CRUD', 'Priority System', 'Simple UI'],
            },
            {
              phase: 'Phase 2',
              title: 'Collection Integration',
              features: [
                'Planned Models',
                'Visual Indicators',
                'Purchase Conversion',
              ],
            },
            {
              phase: 'Phase 3',
              title: 'Budget & Planning',
              features: [
                'Budget Tracking',
                'Purchase Analytics',
                'Price Alerts',
              ],
            },
            {
              phase: 'Phase 4',
              title: 'Sharing & Social',
              features: ['Wishlist Sharing', 'Gift Lists', 'Collaboration'],
            },
          ].map((phase, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant='h6' color='primary.main' gutterBottom>
                  {phase.phase}
                </Typography>
                <Typography
                  variant='subtitle1'
                  fontWeight='bold'
                  sx={{ mb: 1 }}
                >
                  {phase.title}
                </Typography>
                <Stack spacing={0.5}>
                  {phase.features.map((feature, featureIndex) => (
                    <Typography
                      key={featureIndex}
                      variant='body2'
                      color='text.secondary'
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Call to Action */}
      <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <BookmarkBorder
            sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }}
          />
          <Typography variant='h5' gutterBottom>
            Ready to Organize Your Dreams?
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            The comprehensive wishlist system is coming! Plan purchases, track
            budgets, and never lose sight of the models you want most. Smart
            collecting starts here.
          </Typography>
          <Stack
            direction='row'
            spacing={2}
            justifyContent='center'
            sx={{ mb: 2 }}
          >
            <Chip label='Smart Budget Planning' color='success' />
            <Chip label='Collection Integration' color='info' />
            <Chip label='Purchase Tracking' color='warning' />
          </Stack>
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
