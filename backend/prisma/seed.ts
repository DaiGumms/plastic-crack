import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Game Systems
  const warhammer40k = await prisma.gameSystem.upsert({
    where: { shortName: 'W40K' },
    update: {},
    create: {
      name: 'Warhammer 40,000',
      shortName: 'W40K',
      description:
        'The grim darkness of the far future where there is only war',
      publisher: 'Games Workshop',
      sortOrder: 1,
    },
  });

  const ageOfSigmar = await prisma.gameSystem.upsert({
    where: { shortName: 'AOS' },
    update: {},
    create: {
      name: 'Age of Sigmar',
      shortName: 'AOS',
      description: 'Fantasy battles in the Mortal Realms',
      publisher: 'Games Workshop',
      sortOrder: 2,
    },
  });

  const killTeam = await prisma.gameSystem.upsert({
    where: { shortName: 'KT' },
    update: {},
    create: {
      name: 'Kill Team',
      shortName: 'KT',
      description: 'Small-scale squad-based combat in the 41st Millennium',
      publisher: 'Games Workshop',
      sortOrder: 3,
    },
  });

  // Seed Warhammer 40K Factions
  const w40kFactions = [
    { name: 'Space Marines', description: "The Emperor's finest warriors" },
    {
      name: 'Chaos Space Marines',
      description: 'Traitorous Astartes who serve the Dark Gods',
    },
    { name: 'Imperial Guard', description: 'The vast armies of the Imperium' },
    { name: 'Orks', description: 'Green-skinned warlike aliens' },
    { name: 'Eldar', description: 'Ancient and sophisticated aliens' },
    { name: 'Dark Eldar', description: 'Sadistic raiders from the Dark City' },
    {
      name: 'Tau Empire',
      description: 'Technologically advanced aliens seeking the Greater Good',
    },
    {
      name: 'Tyranids',
      description: 'Horrific bio-engineered swarm creatures',
    },
    {
      name: 'Necrons',
      description: 'Ancient robotic beings awakening from eons of slumber',
    },
    { name: 'Chaos Daemons', description: 'Manifestations of the Chaos Gods' },
  ];

  for (const faction of w40kFactions) {
    await prisma.faction.upsert({
      where: {
        name_gameSystemId: {
          name: faction.name,
          gameSystemId: warhammer40k.id,
        },
      },
      update: {},
      create: {
        name: faction.name,
        description: faction.description,
        gameSystemId: warhammer40k.id,
      },
    });
  }

  // Seed Age of Sigmar Factions
  const aosFactions = [
    { name: 'Stormcast Eternals', description: "Sigmar's immortal warriors" },
    { name: 'Chaos Warriors', description: 'Champions of the Dark Gods' },
    { name: 'Seraphon', description: 'Starborne lizardmen' },
    { name: 'Sylvaneth', description: 'Tree spirits and forest dwellers' },
    { name: 'Daughters of Khaine', description: 'Bloodthirsty aelf warriors' },
    { name: 'Idoneth Deepkin', description: 'Soul-raiders from the depths' },
  ];

  for (const faction of aosFactions) {
    await prisma.faction.upsert({
      where: {
        name_gameSystemId: {
          name: faction.name,
          gameSystemId: ageOfSigmar.id,
        },
      },
      update: {},
      create: {
        name: faction.name,
        description: faction.description,
        gameSystemId: ageOfSigmar.id,
      },
    });
  }

  // Seed Default Tags
  console.log('🏷️ Seeding default tags...');
  
  const defaultTags = [
    // General tags
    { name: 'Infantry', category: 'UNIT_TYPE', color: '#3B82F6', description: 'Foot soldiers and basic troops' },
    { name: 'Vehicle', category: 'UNIT_TYPE', color: '#8B5CF6', description: 'Tanks, transports, and vehicles' },
    { name: 'Character', category: 'UNIT_TYPE', color: '#F59E0B', description: 'Heroes, leaders, and special characters' },
    { name: 'Monster', category: 'UNIT_TYPE', color: '#EF4444', description: 'Large creatures and beasts' },
    
    // Painting status tags
    { name: 'Unpainted', category: 'STATUS', color: '#6B7280', description: 'Not yet started painting' },
    { name: 'Work in Progress', category: 'STATUS', color: '#F59E0B', description: 'Currently being painted' },
    { name: 'Completed', category: 'STATUS', color: '#10B981', description: 'Finished painting' },
    { name: 'Showcase', category: 'STATUS', color: '#8B5CF6', description: 'Display quality miniatures' },
    
    // Painting techniques
    { name: 'Drybrushing', category: 'TECHNIQUE', color: '#F97316', description: 'Dry brush highlighting technique' },
    { name: 'Washing', category: 'TECHNIQUE', color: '#0EA5E9', description: 'Wash and shade technique' },
    { name: 'Edge Highlighting', category: 'TECHNIQUE', color: '#F59E0B', description: 'Fine edge highlight technique' },
    { name: 'OSL', category: 'TECHNIQUE', color: '#8B5CF6', description: 'Object Source Lighting effects' },
    { name: 'NMM', category: 'TECHNIQUE', color: '#6B7280', description: 'Non-Metallic Metal technique' },
    { name: 'Weathering', category: 'TECHNIQUE', color: '#92400E', description: 'Battle damage and aging effects' },
    
    // Game systems
    { name: 'Warhammer 40K', category: 'GAME_SYSTEM', color: '#DC2626', description: 'Warhammer 40,000 models' },
    { name: 'Age of Sigmar', category: 'GAME_SYSTEM', color: '#1D4ED8', description: 'Age of Sigmar models' },
    { name: 'Kill Team', category: 'GAME_SYSTEM', color: '#059669', description: 'Kill Team models' },
    
    // Common categories
    { name: 'Troops', category: 'UNIT_TYPE', color: '#16A34A', description: 'Basic battlefield units' },
    { name: 'Elite', category: 'UNIT_TYPE', color: '#DC2626', description: 'Elite specialized units' },
    { name: 'Heavy Support', category: 'UNIT_TYPE', color: '#7C2D12', description: 'Heavy weapons and support' },
    { name: 'Fast Attack', category: 'UNIT_TYPE', color: '#0284C7', description: 'Fast moving units' },
    { name: 'HQ', category: 'UNIT_TYPE', color: '#7C3AED', description: 'Headquarters and commanders' },
    
    // Quality/condition
    { name: 'Kitbashed', category: 'GENERAL', color: '#059669', description: 'Custom converted models' },
    { name: 'Magnetized', category: 'GENERAL', color: '#6B7280', description: 'Models with magnetic weapon options' },
    { name: 'Vintage', category: 'GENERAL', color: '#92400E', description: 'Older or classic models' },
    { name: 'Competition', category: 'GENERAL', color: '#7C2D12', description: 'Competition painted models' },
  ] as const;

  const createdTags: any[] = [];
  
  for (const tag of defaultTags) {
    const createdTag = await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        category: tag.category,
        color: tag.color,
        description: tag.description,
        isOfficial: true,
      },
    });
    createdTags.push(createdTag);
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(
    `📊 Created game systems: ${[warhammer40k, ageOfSigmar, killTeam].length}`
  );
  console.log(
    `🏛️ Created factions: ${w40kFactions.length + aosFactions.length}`
  );
  console.log(`🏷️ Created tags: ${createdTags.length}`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
