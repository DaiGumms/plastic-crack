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

  console.log('✅ Database seeding completed successfully!');
  console.log(
    `📊 Created game systems: ${[warhammer40k, ageOfSigmar, killTeam].length}`
  );
  console.log(
    `🏛️ Created factions: ${w40kFactions.length + aosFactions.length}`
  );
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
