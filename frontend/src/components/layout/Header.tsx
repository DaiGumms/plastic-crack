import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  ExitToApp,
  Dashboard,
  Person,
  Home,
  Login,
  PersonAdd,
  Collections,
  Category,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/');
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Models', path: '/models', icon: <Category /> },
    ...(isAuthenticated
      ? [
          { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
          { label: 'Collections', path: '/collections', icon: <Collections /> },
          { label: 'Profile', path: '/profile', icon: <Person /> },
          { label: 'Settings', path: '/settings', icon: <Settings /> },
        ]
      : []),
  ];

  const authItems = isAuthenticated
    ? []
    : [
        { label: 'Sign In', path: '/auth/login', icon: <Login /> },
        { label: 'Sign Up', path: '/auth/register', icon: <PersonAdd /> },
      ];

  const mobileDrawer = (
    <Box sx={{ width: 250 }} role='presentation'>
      <Box sx={{ p: 2 }}>
        <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
          Plastic Crack
        </Typography>
      </Box>
      <Divider />

      <List>
        {navigationItems.map(item => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleMobileDrawerToggle}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      {!isAuthenticated && (
        <>
          <Divider />
          <List>
            {authItems.map(item => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleMobileDrawerToggle}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {isAuthenticated && user && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                {(user.displayName || user.username)?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant='body2' fontWeight='medium'>
                {user.displayName || user.username}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant='outlined'
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              size='small'
            >
              Sign Out
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position='sticky' elevation={1}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge='start'
              color='inherit'
              aria-label='menu'
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant='h6'
            component={Link}
            to='/'
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              mr: 4,
            }}
          >
            Plastic Crack
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navigationItems.map(item => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color='inherit'
                  startIcon={item.icon}
                  sx={{ textTransform: 'none' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Desktop Auth Section */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated && user ? (
                <>
                  <Button
                    color='inherit'
                    startIcon={
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.displayName || user.username}
                        sx={{ width: 24, height: 24 }}
                      >
                        {(user.displayName || user.username)
                          ?.charAt(0)
                          .toUpperCase()}
                      </Avatar>
                    }
                    onClick={handleUserMenuOpen}
                    sx={{ textTransform: 'none' }}
                  >
                    {user.displayName || user.username}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem
                      component={Link}
                      to='/profile'
                      onClick={handleUserMenuClose}
                    >
                      <Person sx={{ mr: 1 }} />
                      Profile
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to='/settings'
                      onClick={handleUserMenuClose}
                    >
                      <Settings sx={{ mr: 1 }} />
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 1 }} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to='/auth/login'
                    color='inherit'
                    startIcon={<Login />}
                    sx={{ textTransform: 'none' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    to='/auth/register'
                    variant='contained'
                    startIcon={<PersonAdd />}
                    sx={{
                      textTransform: 'none',
                      ml: 1,
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor='left'
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
};
