import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  // Seed Game Systems
  console.log('🎮 Seeding game systems...');
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

  console.log('✅ Game systems created');

  // Seed Warhammer 40K Factions
  console.log('🏛️ Seeding Warhammer 40K factions...');
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
    {
      name: 'Imperial Knights',
      description: 'Towering war machines of noble houses',
    },
    {
      name: 'Adeptus Mechanicus',
      description: 'Tech-priests and their cybernetic legions',
    },
    { name: 'Death Guard', description: 'Plague-ridden servants of Nurgle' },
    { name: 'Thousand Sons', description: 'Sorcerous warriors of Tzeentch' },
    { name: 'World Eaters', description: 'Berserker devotees of Khorne' },
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
  console.log('🏛️ Seeding Age of Sigmar factions...');
  const aosFactions = [
    { name: 'Stormcast Eternals', description: "Sigmar's immortal warriors" },
    { name: 'Chaos Warriors', description: 'Champions of the Dark Gods' },
    { name: 'Seraphon', description: 'Starborne lizardmen' },
    { name: 'Sylvaneth', description: 'Tree spirits and forest dwellers' },
    { name: 'Daughters of Khaine', description: 'Bloodthirsty aelf warriors' },
    { name: 'Idoneth Deepkin', description: 'Soul-raiders from the depths' },
    { name: 'Nighthaunt', description: 'Spectral undead legion' },
    { name: 'Ossiarch Bonereapers', description: 'Constructed bone legions' },
    {
      name: 'Cities of Sigmar',
      description: 'Mortal defenders of civilization',
    },
    { name: 'Orruk Warclans', description: 'Savage greenskin tribes' },
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
    // Unit Types
    {
      name: 'Infantry',
      category: 'UNIT_TYPE',
      color: '#3B82F6',
      description: 'Foot soldiers and basic troops',
    },
    {
      name: 'Vehicle',
      category: 'UNIT_TYPE',
      color: '#8B5CF6',
      description: 'Tanks, transports, and vehicles',
    },
    {
      name: 'Character',
      category: 'UNIT_TYPE',
      color: '#F59E0B',
      description: 'Heroes, leaders, and special characters',
    },
    {
      name: 'Monster',
      category: 'UNIT_TYPE',
      color: '#EF4444',
      description: 'Large creatures and beasts',
    },
    {
      name: 'Troops',
      category: 'UNIT_TYPE',
      color: '#16A34A',
      description: 'Basic battlefield units',
    },
    {
      name: 'Elite',
      category: 'UNIT_TYPE',
      color: '#DC2626',
      description: 'Elite specialized units',
    },
    {
      name: 'Heavy Support',
      category: 'UNIT_TYPE',
      color: '#7C2D12',
      description: 'Heavy weapons and support',
    },
    {
      name: 'Fast Attack',
      category: 'UNIT_TYPE',
      color: '#0284C7',
      description: 'Fast moving units',
    },
    {
      name: 'HQ',
      category: 'UNIT_TYPE',
      color: '#7C3AED',
      description: 'Headquarters and commanders',
    },

    // Painting Status
    {
      name: 'Unpainted',
      category: 'STATUS',
      color: '#6B7280',
      description: 'Not yet started painting',
    },
    {
      name: 'Work in Progress',
      category: 'STATUS',
      color: '#F59E0B',
      description: 'Currently being painted',
    },
    {
      name: 'Completed',
      category: 'STATUS',
      color: '#10B981',
      description: 'Finished painting',
    },
    {
      name: 'Showcase',
      category: 'STATUS',
      color: '#8B5CF6',
      description: 'Display quality miniatures',
    },

    // Painting Techniques
    {
      name: 'Drybrushing',
      category: 'TECHNIQUE',
      color: '#F97316',
      description: 'Dry brush highlighting technique',
    },
    {
      name: 'Washing',
      category: 'TECHNIQUE',
      color: '#0EA5E9',
      description: 'Wash and shade technique',
    },
    {
      name: 'Edge Highlighting',
      category: 'TECHNIQUE',
      color: '#F59E0B',
      description: 'Fine edge highlight technique',
    },
    {
      name: 'OSL',
      category: 'TECHNIQUE',
      color: '#8B5CF6',
      description: 'Object Source Lighting effects',
    },
    {
      name: 'NMM',
      category: 'TECHNIQUE',
      color: '#6B7280',
      description: 'Non-Metallic Metal technique',
    },
    {
      name: 'Weathering',
      category: 'TECHNIQUE',
      color: '#92400E',
      description: 'Battle damage and aging effects',
    },

    // Game Systems
    {
      name: 'Warhammer 40K',
      category: 'GAME_SYSTEM',
      color: '#DC2626',
      description: 'Warhammer 40,000 models',
    },
    {
      name: 'Age of Sigmar',
      category: 'GAME_SYSTEM',
      color: '#1D4ED8',
      description: 'Age of Sigmar models',
    },
    {
      name: 'Kill Team',
      category: 'GAME_SYSTEM',
      color: '#059669',
      description: 'Kill Team models',
    },
  ];

  const createdTags: any[] = [];
  for (const tagData of defaultTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: {
        name: tagData.name,
        category: tagData.category as any,
        color: tagData.color,
        description: tagData.description,
      },
    });
    createdTags.push(tag);
  }

  console.log('✅ Production database seeding completed successfully!');
  console.log(`📊 Game systems: ${await prisma.gameSystem.count()}`);
  console.log(`🏛️ Factions: ${await prisma.faction.count()}`);
  console.log(`🏷️ Tags: ${await prisma.tag.count()}`);

  console.log('\n🎯 Critical data seeded for production:');
  console.log('- Game systems with factions for content organization');
  console.log('- Default tags for categorizing models and collections');
  console.log('- No mock users or test data included');
}

main()
  .catch(e => {
    console.error('❌ Production seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
