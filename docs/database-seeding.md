# Intelligent Database Seeding

This project now includes intelligent database seeding to prevent duplicate data issues during
development.

## How It Works

The smart seeding system automatically detects if your database already contains data and gives you
options on how to proceed:

1. **Empty Database**: Automatically seeds with test data
2. **Existing Data**: Gives you options to handle the situation

## Available Options

### Development Setup Commands

```bash
# Standard setup (skips seeding if data exists)
npm run setup

# Force reset database and reseed with fresh data
npm run setup:force-reseed

# Skip database seeding entirely
npm run setup:skip-seed

# Add seed data to existing database (may create duplicates)
npm run setup:add-to-existing
```

### Standalone Seeding Commands

```bash
# Smart seeding (interactive mode)
npm run db:seed:smart

# Force reset and reseed
npm run db:seed:force

# Skip seeding
npm run db:seed:skip

# Traditional seeding (may create duplicates)
npm run db:seed
```

## Interactive Mode

When running `npm run db:seed:smart` directly, you'll be prompted with options if existing data is
found:

```
📊 Current database contents:
   Users: 10
   Game Systems: 2
   Factions: 25
   Models: 5
   Collections: 15

⚠️ Database contains existing data. Choose an option:
1. Skip seeding (recommended - keeps existing data intact)
2. Reset database and reseed (⚠️ DESTROYS ALL EXISTING DATA)
3. Add seed data to existing database (may create duplicates)

Enter your choice (1-3):
```

## Command Line Flags

When using the smart seeding script, you can pass flags for automated behavior:

- `--automated`: Skip prompts, default to preserving existing data
- `--force-reset`: Reset database and reseed (DESTRUCTIVE)
- `--skip-seed`: Skip seeding entirely
- `--add-to-existing`: Add to existing data (may create duplicates)

## VS Code Task Integration

Your VS Code task will now:

1. Check if the database has existing data
2. By default, skip seeding if data exists (preserving your work)
3. Only seed if the database is empty

This prevents the duplicate data issue you were experiencing.

## Best Practices

### For Development

- Use `npm run setup` for daily development (preserves existing data)
- Use `npm run setup:force-reseed` when you want a completely fresh start

### For Testing

- Use `npm run setup:force-reseed` to ensure consistent test data
- Use `npm run setup:skip-seed` if you want to test with an empty database

### For Production

- Never use the development seed scripts in production
- Use dedicated production seeding scripts when needed

## Data Preservation

The smart seeding system is designed to be safe-by-default:

- **Default behavior**: Preserve existing data
- **Explicit flags required**: For destructive operations
- **Clear warnings**: When data will be destroyed
- **Interactive confirmations**: For destructive operations in interactive mode

## Troubleshooting

### "Database connection failed"

- Ensure Docker containers are running: `npm run docker:up`
- Wait for services to fully initialize

### "Seeding failed"

- Check database logs: `npm run docker:logs`
- Verify migrations are up to date: `npm run db:migrate`

### "Duplicate data still appearing"

- Use `npm run setup:force-reseed` for a completely clean start
- Check if seed script has proper `upsert` operations

## Migration from Old System

If you were using the old seeding system and have duplicate data:

1. Run `npm run setup:force-reseed` to clean start
2. From now on, use `npm run setup` for daily development
3. The system will preserve your data and only seed when the database is empty
