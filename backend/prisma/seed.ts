import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

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

    // Painting status tags
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

    // Painting techniques
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

    // Game systems
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

    // Common categories
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

    // Quality/condition
    {
      name: 'Kitbashed',
      category: 'GENERAL',
      color: '#059669',
      description: 'Custom converted models',
    },
    {
      name: 'Magnetized',
      category: 'GENERAL',
      color: '#6B7280',
      description: 'Models with magnetic weapon options',
    },
    {
      name: 'Vintage',
      category: 'GENERAL',
      color: '#92400E',
      description: 'Older or classic models',
    },
    {
      name: 'Competition',
      category: 'GENERAL',
      color: '#7C2D12',
      description: 'Competition painted models',
    },
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
  console.log(`📊 Created game systems: ${[warhammer40k, ageOfSigmar].length}`);
  console.log(
    `🏛️ Created factions: ${w40kFactions.length + aosFactions.length}`
  );
  console.log(`🏷️ Created tags: ${createdTags.length}`);

  // Create Mock Users for Testing
  console.log('👥 Creating mock users...');

  const mockUsers = [
    {
      username: 'paintmaster_alex',
      email: 'alex@example.com',
      displayName: 'Alex the Paint Master',
      bio: 'Professional miniature painter with 15+ years experience. Love trying new techniques!',
      isProfilePublic: true,
    },
    {
      username: 'warhammer_sarah',
      email: 'sarah@example.com',
      displayName: 'Sarah W.',
      bio: 'Competitive 40K player and collector. Always looking for new army builds.',
      isProfilePublic: true,
    },
    {
      username: 'hobbyist_mike',
      email: 'mike@example.com',
      displayName: 'Mike H.',
      bio: 'Weekend warrior painter. Still learning but loving every minute!',
      isProfilePublic: false,
    },
    {
      username: 'veteran_jane',
      email: 'jane@example.com',
      displayName: 'Jane "Veteran" Thompson',
      bio: 'Been in the hobby since Rogue Trader. Collector of vintage and new.',
      isProfilePublic: true,
    },
    {
      username: 'kitbash_king',
      email: 'kevin@example.com',
      displayName: 'Kevin the Kitbash King',
      bio: 'Custom conversions and kitbashing specialist. No model is safe from modification!',
      isProfilePublic: true,
    },
  ];

  const createdUsers: any[] = [];
  for (const userData of mockUsers) {
    const hashedPassword = await bcrypt.hash('demo123', 10); // Simple password for mock users
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        displayName: userData.displayName,
        bio: userData.bio,
        emailVerified: true,
        isProfilePublic: userData.isProfilePublic,
        experienceLevel: userData.isProfilePublic ? 'ADVANCED' : 'INTERMEDIATE',
      },
    });
    createdUsers.push(user);
  }

  // Create some master models in the catalog first
  console.log('🎨 Creating master models...');

  // Get factions for creating models
  const spaceMarinesFaction = await prisma.faction.findFirst({
    where: { name: 'Space Marines', gameSystem: { shortName: 'W40K' } },
  });
  
  const chaosFaction = await prisma.faction.findFirst({
    where: { name: 'Chaos Space Marines', gameSystem: { shortName: 'W40K' } },
  });

  const stormcastFaction = await prisma.faction.findFirst({
    where: { name: 'Stormcast Eternals', gameSystem: { shortName: 'AOS' } },
  });

  // Create master models
  const masterModels: any[] = [];

  if (spaceMarinesFaction) {
    const captainModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Captain in Terminator Armor',
          gameSystemId: warhammer40k.id,
          factionId: spaceMarinesFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Captain in Terminator Armor',
        description: 'Space Marine Captain equipped with tactical dreadnought armor',
        gameSystemId: warhammer40k.id,
        factionId: spaceMarinesFaction.id,
        modelType: 'Character',
        officialPointsCost: 180,
        tags: ['HQ', 'Character', 'Infantry'],
      },
    });

    const tacticalSquadModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Tactical Squad',
          gameSystemId: warhammer40k.id,
          factionId: spaceMarinesFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Tactical Squad',
        description: '10-man tactical squad of Space Marines',
        gameSystemId: warhammer40k.id,
        factionId: spaceMarinesFaction.id,
        modelType: 'Infantry',
        officialPointsCost: 170,
        tags: ['Troops', 'Infantry'],
      },
    });

    const predatorModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Predator Destructor',
          gameSystemId: warhammer40k.id,
          factionId: spaceMarinesFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Predator Destructor',
        description: 'Heavy support tank armed with autocannon',
        gameSystemId: warhammer40k.id,
        factionId: spaceMarinesFaction.id,
        modelType: 'Vehicle',
        officialPointsCost: 130,
        tags: ['Heavy Support', 'Vehicle'],
      },
    });

    masterModels.push(captainModel, tacticalSquadModel, predatorModel);
  }

  if (chaosFaction) {
    const chaosLordModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Chaos Lord',
          gameSystemId: warhammer40k.id,
          factionId: chaosFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Chaos Lord',
        description: 'Chaos Space Marine Lord',
        gameSystemId: warhammer40k.id,
        factionId: chaosFaction.id,
        modelType: 'Character',
        officialPointsCost: 90,
        tags: ['HQ', 'Character', 'Infantry'],
      },
    });

    masterModels.push(chaosLordModel);
  }

  if (stormcastFaction) {
    const lordAquilorModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Lord-Aquilor',
          gameSystemId: ageOfSigmar.id,
          factionId: stormcastFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Lord-Aquilor',
        description: 'Stormcast Eternal Lord on Gryph-charger',
        gameSystemId: ageOfSigmar.id,
        factionId: stormcastFaction.id,
        modelType: 'Character',
        officialPointsCost: 155,
        tags: ['Leader', 'Character', 'Beast'],
      },
    });

    const liberatorSquadModel = await prisma.model.upsert({
      where: {
        name_gameSystemId_factionId: {
          name: 'Liberator Squad',
          gameSystemId: ageOfSigmar.id,
          factionId: stormcastFaction.id,
        },
      },
      update: {},
      create: {
        name: 'Liberator Squad',
        description: 'Stormcast Eternal Liberator squad',
        gameSystemId: ageOfSigmar.id,
        factionId: stormcastFaction.id,
        modelType: 'Infantry',
        officialPointsCost: 120,
        tags: ['Battleline', 'Infantry'],
      },
    });

    masterModels.push(lordAquilorModel, liberatorSquadModel);
  }

  // Create Collections and User Models for each user
  console.log('📚 Creating collections and user models...');

  // Alex's Collections
  if (createdUsers[0] && masterModels.length > 0) {
    const alexCollection1 = await prisma.collection.create({
      data: {
        name: 'Ultramarines 2nd Company',
        description: 'My pride and joy - a fully painted Ultramarines battle company with custom weathering effects.',
        isPublic: true,
        userId: createdUsers[0].id,
        gameSystemId: warhammer40k.id,
      },
    });

    // Add user models to the collection
    const captainUserModel = await prisma.userModel.create({
      data: {
        modelId: masterModels.find(m => m.name === 'Captain in Terminator Armor')?.id || masterModels[0].id,
        collectionId: alexCollection1.id,
        userId: createdUsers[0].id,
        customName: 'Captain Alexius',
        paintingStatus: 'COMPLETED',
        notes: 'Custom power sword OSL effects',
        purchaseDate: new Date('2023-06-15'),
        tags: ['Completed', 'OSL', 'Custom'],
      },
    });

    if (masterModels.find(m => m.name === 'Tactical Squad')) {
      const tacticalUserModel = await prisma.userModel.create({
        data: {
          modelId: masterModels.find(m => m.name === 'Tactical Squad')!.id,
          collectionId: alexCollection1.id,
          userId: createdUsers[0].id,
          customName: 'Tactical Squad Alexius',
          paintingStatus: 'COMPLETED',
          notes: '10-man tactical squad with plasma cannon. Battle-worn appearance.',
          purchaseDate: new Date('2023-05-20'),
          tags: ['Completed', 'Weathering'],
        },
      });
    }
  }

  // Sarah's Collection
  if (createdUsers[1] && masterModels.length > 0) {
    const sarahCollection = await prisma.collection.create({
      data: {
        name: 'Tournament Army - Iron Hands',
        description: 'My competitive Iron Hands list. Optimized for current meta.',
        isPublic: true,
        userId: createdUsers[1].id,
        gameSystemId: warhammer40k.id,
      },
    });

    const sarahCaptain = await prisma.userModel.create({
      data: {
        modelId: masterModels.find(m => m.name === 'Captain in Terminator Armor')?.id || masterModels[0].id,
        collectionId: sarahCollection.id,
        userId: createdUsers[1].id,
        customName: 'Iron Father Kardan',
        paintingStatus: 'COMPLETED',
        notes: 'Army centerpiece - magnetized weapon options',
        purchaseDate: new Date('2023-09-15'),
        tags: ['Tournament Ready', 'Magnetized'],
      },
    });
  }

  // Mike's Collection (Private)
  if (createdUsers[2] && stormcastFaction && masterModels.find(m => m.name === 'Lord-Aquilor')) {
    const mikeCollection = await prisma.collection.create({
      data: {
        name: 'My First Army - Stormcast',
        description: 'Learning to paint with these golden warriors. Slowly improving!',
        isPublic: false,
        userId: createdUsers[2].id,
        gameSystemId: ageOfSigmar.id,
      },
    });

    const mikeLord = await prisma.userModel.create({
      data: {
        modelId: masterModels.find(m => m.name === 'Lord-Aquilor')!.id,
        collectionId: mikeCollection.id,
        userId: createdUsers[2].id,
        customName: 'Lord-Aquilor Stormbringer',
        paintingStatus: 'COMPLETED',
        notes: 'My first character model - pretty proud of how it turned out',
        purchaseDate: new Date('2023-09-01'),
        tags: ['First Model', 'Learning'],
      },
    });
  }

  console.log('✅ Mock users and collections created successfully!');
  console.log(`👥 Created users: ${createdUsers.length}`);
  console.log(`🎨 Created master models: ${masterModels.length}`);
  
  const totalCollections = await prisma.collection.count();
  const totalUserModels = await prisma.userModel.count();
  
  console.log(`📚 Total collections in database: ${totalCollections}`);
  console.log(`🎨 Total user models in database: ${totalUserModels}`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
