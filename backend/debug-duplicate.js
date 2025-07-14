// Debug script to understand the duplicate email test issue
import { PrismaClient } from './src/generated/prisma/index.js';
import { AuthService } from './src/services/auth.service.js';

const prisma = new PrismaClient();

async function testDuplicateFlow() {
  try {
    console.log('Setting up test...');
    
    // Clean up first
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'debug-test' } },
          { username: { contains: 'debuguser' } },
        ],
      },
    });

    const testEmail = 'debug-test@example.com';
    const testUsername = 'debuguser123';
    const testPassword = 'TestPassword123!';

    console.log('Creating first user with email:', testEmail);
    
    // Create first user
    const user1 = await AuthService.register(
      testUsername,
      testEmail,
      testPassword,
      'First User'
    );
    
    console.log('First user created successfully:', user1.user.email);

    console.log('Attempting to create duplicate user...');
    
    // Try to create duplicate
    try {
      const user2 = await AuthService.register(
        'differentuser',
        testEmail, // Same email
        testPassword,
        'Second User'
      );
      
      console.log('ERROR: Duplicate user was created!', user2.user.email);
    } catch (error) {
      console.log('SUCCESS: Duplicate prevented with error:', error.message);
    }
    
    // Check database state
    const allUsers = await prisma.user.findMany({
      where: { email: testEmail }
    });
    
    console.log('Users in database with this email:', allUsers.length);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'debug-test' } },
          { username: { contains: 'debuguser' } },
        ],
      },
    });
    
    await prisma.$disconnect();
  }
}

testDuplicateFlow();
