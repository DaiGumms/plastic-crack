import React from 'react';
import { Button } from '../components/ui/Button';
import { useHealthCheck } from '../hooks/api';
import { useAppStore } from '../store';

export const HomePage: React.FC = () => {
  const { data: health, isLoading: healthLoading } = useHealthCheck();
  const { toggleDarkMode, isDarkMode, addNotification } = useAppStore();

  const handleTestNotification = () => {
    addNotification({
      type: 'success',
      title: 'Welcome to Plastic Crack!',
      message: 'Your web application is working correctly.',
    });
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8'>
      <div className='max-w-4xl mx-auto text-center space-y-8'>
        {/* Header */}
        <div className='space-y-4'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 dark:text-white'>
            Plastic Crack
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Warhammer Collection Management Platform
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
          <div className='card'>
            <h3 className='text-lg font-semibold mb-2'>
              Collection Management
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Track your miniatures, painting progress, and organize your armies
            </p>
          </div>

          <div className='card'>
            <h3 className='text-lg font-semibold mb-2'>Price Intelligence</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Real-time price comparison and deal tracking across retailers
            </p>
          </div>

          <div className='card'>
            <h3 className='text-lg font-semibold mb-2'>Social Features</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Share your collections and connect with the community
            </p>
          </div>
        </div>

        {/* Status and Controls */}
        <div className='space-y-4'>
          <div className='flex items-center justify-center space-x-2'>
            <span className='text-sm text-gray-500'>API Status:</span>
            {healthLoading ? (
              <span className='text-yellow-500'>Checking...</span>
            ) : health ? (
              <span className='text-green-500'>Connected</span>
            ) : (
              <span className='text-red-500'>Disconnected</span>
            )}
          </div>

          <div className='flex flex-wrap justify-center gap-4'>
            <Button onClick={handleTestNotification}>Test Notification</Button>
            <Button variant='outline' onClick={toggleDarkMode}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>

        {/* Tech Stack */}
        <div className='border-t pt-8 mt-12'>
          <h3 className='text-lg font-semibold mb-4'>Technology Stack</h3>
          <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
            <span>React 18</span>
            <span>TypeScript</span>
            <span>Vite</span>
            <span>Tailwind CSS</span>
            <span>React Query</span>
            <span>Zustand</span>
            <span>PWA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
