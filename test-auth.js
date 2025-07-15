// Simple auth test script
const API_BASE = 'http://localhost:3001/api/v1';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow...');
  
  try {
    // 1. Test registration
    console.log('\n1. Testing Registration...');
    const registerData = {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      displayName: 'Test User'
    };
    
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.error('❌ Registration failed:', error);
      return;
    }
    
    const registerResult = await registerResponse.json();
    console.log('✅ Registration successful');
    console.log('📄 Response format:', Object.keys(registerResult));
    
    const token = registerResult.token || registerResult.accessToken;
    
    if (!token) {
      console.error('❌ No token in registration response');
      return;
    }
    
    // 2. Test /auth/me with token
    console.log('\n2. Testing /auth/me...');
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 /auth/me status:', meResponse.status);
    
    if (!meResponse.ok) {
      const error = await meResponse.text();
      console.error('❌ /auth/me failed:', error);
      return;
    }
    
    const meResult = await meResponse.json();
    console.log('✅ /auth/me successful');
    console.log('📄 User data:', meResult.user ? 'present' : 'missing');
    
    // 3. Test profile update
    console.log('\n3. Testing Profile Update...');
    const profileUpdateData = {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'Updated bio'
    };
    
    const profileResponse = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileUpdateData)
    });
    
    console.log('📊 Profile update status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.error('❌ Profile update failed:', error);
    } else {
      console.log('✅ Profile update successful');
    }
    
    // 4. Test login
    console.log('\n4. Testing Login...');
    const loginData = {
      emailOrUsername: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    console.log('📊 Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Login failed:', error);
    } else {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('📄 Login response format:', Object.keys(loginResult));
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

testAuth();
