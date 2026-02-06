import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const universities = [
  { name: "Université de Strasbourg", latitude: 48.5806, longitude: 7.7645 },
  { name: "Sorbonne Université", latitude: 48.8472, longitude: 2.3444 },
  { name: "Université Paris-Saclay", latitude: 48.7107, longitude: 2.1678 },
  { name: "Aix-Marseille Université", latitude: 43.5283, longitude: 5.4497 },
  { name: "Université de Bordeaux", latitude: 44.8258, longitude: -0.5907 },
  { name: "Université de Lorraine", latitude: 48.6961, longitude: 6.1738 },
  { name: "Université Claude Bernard Lyon 1", latitude: 45.7808, longitude: 4.8660 },
  { name: "Université de Montpellier", latitude: 43.6309, longitude: 3.8617 },
  { name: "Université de Lille", latitude: 50.6091, longitude: 3.1384 },
  { name: "Université Grenoble Alpes", latitude: 45.1916, longitude: 5.7667 },
  { name: "Université de Rennes", latitude: 48.1189, longitude: -1.6372 },
  { name: "Université de Nantes", latitude: 47.2458, longitude: -1.5519 },
  { name: "Université Côte d'Azur", latitude: 43.7167, longitude: 7.2750 },
  { name: "Université Toulouse III - Paul Sabatier", latitude: 43.5613, longitude: 1.4673 },
  { name: "Université Paris Cité", latitude: 48.8549, longitude: 2.3385 },
  { name: "Université de Rouen Normandie", latitude: 49.4632, longitude: 1.0706 },
  { name: "Université de Poitiers", latitude: 46.5684, longitude: 0.3846 },
  { name: "Université de Caen Normandie", latitude: 49.1925, longitude: -0.3643 },
  { name: "Université de Bourgogne", latitude: 47.3115, longitude: 5.0685 },
  { name: "Université de Tours", latitude: 47.3559, longitude: 0.6865 }
];

async function main() {
  console.log(`🌱 Début du remplissage de la base de données...`);

  for (const school of universities) {
    // On utilise upsert pour ne pas créer de doublons si on relance le script
    const createdSchool = await prisma.school.upsert({
      where: { name: school.name },
      update: {}, // Si elle existe, on ne touche à rien
      create: {
        name: school.name,
        // ⚠️ Si ton schema.prisma n'a pas encore latitude/longitude, commente ces 2 lignes :
        latitude: school.latitude,
        longitude: school.longitude,
      },
    });
    console.log(`✅ Ajouté : ${createdSchool.name}`);
  }

  console.log(`🎉 Terminé !`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });