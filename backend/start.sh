#!/bin/sh
# Production startup script for Plastic Crack API

echo "🚀 Starting Plastic Crack API..."

# Check if we have a database connection
if [ -n "$DATABASE_URL" ]; then
  echo "📊 Database URL found, running migrations..."
  
  # Generate Prisma client (in case it's not already generated)
  npx prisma generate
  
  # Run database migrations
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
  else
    echo "⚠️ Database migrations failed, but continuing startup..."
  fi
else
  echo "⚠️ No DATABASE_URL found, skipping migrations"
fi

# Start the application
echo "🎯 Starting application server..."
exec node dist/index.js
