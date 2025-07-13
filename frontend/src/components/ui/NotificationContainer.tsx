import React from 'react';
import { useAppStore } from '../../store';
import { cn } from '../../utils/cn';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            'max-w-sm p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300',
            {
              'bg-green-50 border-green-200 text-green-800':
                notification.type === 'success',
              'bg-red-50 border-red-200 text-red-800':
                notification.type === 'error',
              'bg-yellow-50 border-yellow-200 text-yellow-800':
                notification.type === 'warning',
              'bg-blue-50 border-blue-200 text-blue-800':
                notification.type === 'info',
            }
          )}
        >
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h4 className='font-medium'>{notification.title}</h4>
              {notification.message && (
                <p className='mt-1 text-sm opacity-90'>
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className='ml-4 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
