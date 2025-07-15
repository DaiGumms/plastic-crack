-- Step 1: Add gameSystemId column as nullable
ALTER TABLE "collections" ADD COLUMN "gameSystemId" TEXT;

-- Step 2: Get the game system IDs and update existing collections
-- First, we'll update collections with 'warhammer-40k' gameSystem to use the proper ID
UPDATE "collections" 
SET "gameSystemId" = (
  SELECT "id" FROM "game_systems" WHERE "shortName" = 'W40K' LIMIT 1
)
WHERE "gameSystem" = 'warhammer-40k';

-- Update collections with 'age-of-sigmar' gameSystem to use the proper ID
UPDATE "collections" 
SET "gameSystemId" = (
  SELECT "id" FROM "game_systems" WHERE "shortName" = 'AOS' LIMIT 1
)
WHERE "gameSystem" = 'age-of-sigmar';

-- Update any other collections to default to Warhammer 40k
UPDATE "collections" 
SET "gameSystemId" = (
  SELECT "id" FROM "game_systems" WHERE "shortName" = 'W40K' LIMIT 1
)
WHERE "gameSystemId" IS NULL;

-- Step 3: Make gameSystemId required and remove old gameSystem column
ALTER TABLE "collections" ALTER COLUMN "gameSystemId" SET NOT NULL;
ALTER TABLE "collections" DROP COLUMN "gameSystem";

-- Step 4: Add foreign key constraint
ALTER TABLE "collections" ADD CONSTRAINT "collections_gameSystemId_fkey" 
FOREIGN KEY ("gameSystemId") REFERENCES "game_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
