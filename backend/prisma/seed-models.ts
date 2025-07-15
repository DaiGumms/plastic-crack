import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting model seeding...');

  // Get existing game systems and factions
  const wh40k = await prisma.gameSystem.findFirst({
    where: { shortName: 'W40K' },
  });
  const aos = await prisma.gameSystem.findFirst({
    where: { shortName: 'AOS' },
  });

  if (!wh40k || !aos) {
    console.error('Game systems not found. Please run the main seed first.');
    return;
  }

  // Get factions
  const spaceMarine = await prisma.faction.findFirst({
    where: { name: 'Space Marines', gameSystemId: wh40k.id },
  });
  const chaosSpaceMarines = await prisma.faction.findFirst({
    where: { name: 'Chaos Space Marines', gameSystemId: wh40k.id },
  });
  const necrons = await prisma.faction.findFirst({
    where: { name: 'Necrons', gameSystemId: wh40k.id },
  });
  const tyranids = await prisma.faction.findFirst({
    where: { name: 'Tyranids', gameSystemId: wh40k.id },
  });
  const stormcast = await prisma.faction.findFirst({
    where: { name: 'Stormcast Eternals', gameSystemId: aos.id },
  });

  // Clear existing models
  await prisma.model.deleteMany();

  // Create Models for Warhammer 40K - Space Marines
  if (spaceMarine) {
    const spaceMarineModels = [
      {
        name: 'Intercessor Squad',
        description:
          'Primaris Space Marine battle-line troops armed with bolt rifles. The backbone of any Primaris force.',
        modelType: 'Infantry',
        officialPointsCost: 105,
        tags: ['Troops', 'Primaris', 'Core', 'Battleline'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
      {
        name: 'Captain in Terminator Armour',
        description:
          'Elite Space Marine commander in heavy Terminator plate with storm bolter and power weapon.',
        modelType: 'Character',
        officialPointsCost: 115,
        tags: ['HQ', 'Character', 'Terminator', 'Leader'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
      {
        name: 'Redemptor Dreadnought',
        description:
          'Massive Primaris walker with devastating firepower and heavy armor plating.',
        modelType: 'Walker',
        officialPointsCost: 185,
        tags: ['Heavy Support', 'Vehicle', 'Dreadnought', 'Walker'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
      {
        name: 'Assault Intercessor Squad',
        description:
          'Close-combat specialists with chainswords and heavy bolt pistols.',
        modelType: 'Infantry',
        officialPointsCost: 95,
        tags: ['Troops', 'Primaris', 'Core', 'Assault'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
      {
        name: 'Librarian',
        description: 'Psyker warrior-scholar wielding the powers of the Warp.',
        modelType: 'Character',
        officialPointsCost: 90,
        tags: ['HQ', 'Character', 'Psyker', 'Leader'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
      {
        name: 'Tactical Squad',
        description:
          'Versatile Firstborn Space Marines with bolters and special weapons.',
        modelType: 'Infantry',
        officialPointsCost: 90,
        tags: ['Troops', 'Firstborn', 'Core', 'Battleline'],
        gameSystemId: wh40k.id,
        factionId: spaceMarine.id,
      },
    ];

    for (const model of spaceMarineModels) {
      await prisma.model.create({ data: model });
    }
    console.log(`Created ${spaceMarineModels.length} Space Marine models`);
  }

  // Create Models for Chaos Space Marines
  if (chaosSpaceMarines) {
    const chaosModels = [
      {
        name: 'Chaos Space Marine Squad',
        description:
          'Corrupted Astartes warriors devoted to the Dark Gods, armed with bolters and close combat weapons.',
        modelType: 'Infantry',
        officialPointsCost: 90,
        tags: ['Troops', 'Chaos', 'Core', 'Battleline'],
        gameSystemId: wh40k.id,
        factionId: chaosSpaceMarines.id,
      },
      {
        name: 'Chaos Lord',
        description:
          'Powerful champion leading the forces of Chaos with dark blessings and brutal weapons.',
        modelType: 'Character',
        officialPointsCost: 80,
        tags: ['HQ', 'Character', 'Chaos', 'Leader'],
        gameSystemId: wh40k.id,
        factionId: chaosSpaceMarines.id,
      },
      {
        name: 'Helbrute',
        description:
          'Daemon-possessed Dreadnought driven mad by corruption and warp energies.',
        modelType: 'Walker',
        officialPointsCost: 120,
        tags: ['Heavy Support', 'Vehicle', 'Daemon', 'Walker'],
        gameSystemId: wh40k.id,
        factionId: chaosSpaceMarines.id,
      },
      {
        name: 'Chaos Cultists',
        description:
          'Fanatical human followers armed with basic weapons and unwavering devotion.',
        modelType: 'Infantry',
        officialPointsCost: 50,
        tags: ['Troops', 'Human', 'Cultist'],
        gameSystemId: wh40k.id,
        factionId: chaosSpaceMarines.id,
      },
      {
        name: 'Chaos Terminator Squad',
        description:
          'Elite warriors in ancient Terminator armor corrupted by Chaos.',
        modelType: 'Infantry',
        officialPointsCost: 170,
        tags: ['Elites', 'Terminator', 'Chaos'],
        gameSystemId: wh40k.id,
        factionId: chaosSpaceMarines.id,
      },
    ];

    for (const model of chaosModels) {
      await prisma.model.create({ data: model });
    }
    console.log(`Created ${chaosModels.length} Chaos Space Marine models`);
  }

  // Create Models for Necrons
  if (necrons) {
    const necronModels = [
      {
        name: 'Necron Warriors',
        description:
          'Basic troops of the Necron legions with gauss flayers that strip matter atom by atom.',
        modelType: 'Infantry',
        officialPointsCost: 130,
        tags: ['Troops', 'Core', 'Necron', 'Battleline'],
        gameSystemId: wh40k.id,
        factionId: necrons.id,
      },
      {
        name: 'Overlord',
        description:
          'Noble Necron commander with ancient authority and devastating weapons.',
        modelType: 'Character',
        officialPointsCost: 95,
        tags: ['HQ', 'Character', 'Noble', 'Leader'],
        gameSystemId: wh40k.id,
        factionId: necrons.id,
      },
      {
        name: 'Canoptek Scarabs',
        description:
          'Swarms of repair constructs that can strip enemy vehicles to their component atoms.',
        modelType: 'Beast',
        officialPointsCost: 45,
        tags: ['Fast Attack', 'Canoptek', 'Swarm'],
        gameSystemId: wh40k.id,
        factionId: necrons.id,
      },
      {
        name: 'Immortals',
        description:
          'Elite Necron troops with advanced weaponry and enhanced resilience.',
        modelType: 'Infantry',
        officialPointsCost: 160,
        tags: ['Troops', 'Core', 'Necron'],
        gameSystemId: wh40k.id,
        factionId: necrons.id,
      },
      {
        name: 'Canoptek Doomstalker',
        description:
          'Spider-like construct with devastating long-range firepower.',
        modelType: 'Vehicle',
        officialPointsCost: 140,
        tags: ['Heavy Support', 'Vehicle', 'Canoptek'],
        gameSystemId: wh40k.id,
        factionId: necrons.id,
      },
    ];

    for (const model of necronModels) {
      await prisma.model.create({ data: model });
    }
    console.log(`Created ${necronModels.length} Necron models`);
  }

  // Create Models for Tyranids
  if (tyranids) {
    const tyranidModels = [
      {
        name: 'Termagants',
        description:
          'Basic Tyranid organisms bred for swarm warfare with fleshborers.',
        modelType: 'Infantry',
        officialPointsCost: 70,
        tags: ['Troops', 'Endless Multitude', 'Swarm'],
        gameSystemId: wh40k.id,
        factionId: tyranids.id,
      },
      {
        name: 'Hive Tyrant',
        description:
          'Apex Tyranid bioform commanding the swarm with psychic might.',
        modelType: 'Monster',
        officialPointsCost: 220,
        tags: ['HQ', 'Monster', 'Synapse', 'Psyker'],
        gameSystemId: wh40k.id,
        factionId: tyranids.id,
      },
      {
        name: 'Carnifex',
        description:
          'Living siege engine and heavy assault creature with crushing claws.',
        modelType: 'Monster',
        officialPointsCost: 130,
        tags: ['Heavy Support', 'Monster'],
        gameSystemId: wh40k.id,
        factionId: tyranids.id,
      },
      {
        name: 'Genestealers',
        description:
          'Swift infiltrators with razor-sharp claws and alien cunning.',
        modelType: 'Infantry',
        officialPointsCost: 120,
        tags: ['Troops', 'Infiltrator'],
        gameSystemId: wh40k.id,
        factionId: tyranids.id,
      },
      {
        name: 'Hormagaunts',
        description: 'Fast-moving assault organisms designed for close combat.',
        modelType: 'Infantry',
        officialPointsCost: 65,
        tags: ['Troops', 'Endless Multitude', 'Assault'],
        gameSystemId: wh40k.id,
        factionId: tyranids.id,
      },
    ];

    for (const model of tyranidModels) {
      await prisma.model.create({ data: model });
    }
    console.log(`Created ${tyranidModels.length} Tyranid models`);
  }

  // Create Models for Age of Sigmar - Stormcast Eternals
  if (stormcast) {
    const stormcastModels = [
      {
        name: 'Liberators',
        description:
          'Core warriors of the Stormcast Eternals with warblades and shields.',
        modelType: 'Infantry',
        officialPointsCost: 115,
        tags: ['Battleline', 'Warrior Chamber'],
        gameSystemId: aos.id,
        factionId: stormcast.id,
      },
      {
        name: 'Lord-Celestant',
        description:
          'Noble commander of the Stormhost wielding ancient weapons.',
        modelType: 'Hero',
        officialPointsCost: 155,
        tags: ['Hero', 'Leader', 'Warrior Chamber'],
        gameSystemId: aos.id,
        factionId: stormcast.id,
      },
      {
        name: 'Retributors',
        description:
          'Heavy infantry with lightning hammers that can shatter mountains.',
        modelType: 'Infantry',
        officialPointsCost: 130,
        tags: ['Warrior Chamber', 'Elite'],
        gameSystemId: aos.id,
        factionId: stormcast.id,
      },
      {
        name: 'Sequitors',
        description:
          'Wizard-warriors who channel storm magic through their weapons.',
        modelType: 'Infantry',
        officialPointsCost: 120,
        tags: ['Battleline', 'Sacrosanct Chamber', 'Wizard'],
        gameSystemId: aos.id,
        factionId: stormcast.id,
      },
      {
        name: 'Lord-Arcanum',
        description: 'Master wizard and leader of the Sacrosanct Chambers.',
        modelType: 'Hero',
        officialPointsCost: 180,
        tags: ['Hero', 'Leader', 'Wizard', 'Sacrosanct Chamber'],
        gameSystemId: aos.id,
        factionId: stormcast.id,
      },
    ];

    for (const model of stormcastModels) {
      await prisma.model.create({ data: model });
    }
    console.log(`Created ${stormcastModels.length} Stormcast Eternal models`);
  }

  const totalModels = await prisma.model.count();
  console.log(
    `✅ Model seeding completed! Created ${totalModels} models total.`
  );
}

main()
  .catch(e => {
    console.error('Error during model seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
