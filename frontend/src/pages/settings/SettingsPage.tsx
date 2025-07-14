import { Link } from 'react-router-dom';

export const SettingsPage = () => {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h1 className='text-2xl font-bold text-gray-900 mb-6'>
              Account Settings
            </h1>

            <div className='text-center text-gray-500'>
              <p>Account settings will be implemented in Phase 3</p>
              <p className='mt-2 text-sm'>This will include:</p>
              <ul className='mt-2 text-sm space-y-1'>
                <li>• Password change</li>
                <li>• Email change</li>
                <li>• Notification preferences</li>
                <li>• Account deletion</li>
              </ul>
              <Link
                to='/'
                className='mt-6 inline-block text-primary-600 hover:text-primary-500'
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
