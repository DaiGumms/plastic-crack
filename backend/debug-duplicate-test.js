const request = require('supertest');
const { app } = require('./src/app');

async function testDuplicate() {
  console.log('Testing duplicate email registration...');
  
  // First registration
  const user1 = {
    username: 'testuser1',
    email: 'test@example.com',
    password: 'SecurePassword123!',
    displayName: 'Test User 1',
  };

  const response1 = await request(app)
    .post('/api/v1/auth/register')
    .send(user1);

  console.log('First registration response:', response1.status, response1.body);

  // Second registration with same email but different username
  const user2 = {
    username: 'testuser2',
    email: 'test@example.com', // Same email
    password: 'SecurePassword123!',
    displayName: 'Test User 2',
  };

  const response2 = await request(app)
    .post('/api/v1/auth/register')
    .send(user2);

  console.log('Second registration response:', response2.status, response2.body);
}

testDuplicate().catch(console.error);
