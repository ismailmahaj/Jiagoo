import { PrismaClient, ProjectStatus, PaymentStatus, BeneficiaryStatus, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await hash("Admin123!", 12);
  const passwordUser = await hash("Donateur123!", 12);

  await prisma.adminLog.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@fondation-jiagoo.org",
      passwordHash: passwordAdmin,
      firstName: "Admin",
      lastName: "Fondation",
      role: Role.ADMIN,
    },
  });

  const donateur = await prisma.user.create({
    data: {
      email: "donateur@example.com",
      passwordHash: passwordUser,
      firstName: "Marie",
      lastName: "Durand",
      phone: "+230 5 123 4567",
      role: Role.USER,
    },
  });

  const p1 = await prisma.project.create({
    data: {
      title: "Bourses excellence 2026",
      slug: "bourses-excellence-2026",
      description:
        "Financement de bourses pour des étudiantes mauriciennes en sciences et lettres, avec accompagnement personnalisé.",
      longDescription:
        "Ce programme vise à soutenir des jeunes femmes talentueuses dans leurs études supérieures à Maurice et à l'étranger. Les fonds couvrent les frais de scolarité, du matériel pédagogique et un tutorat mensuel.",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      ],
      goalAmount: 2500000,
      status: ProjectStatus.EN_COURS,
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title: "Kit numérique pour lycéennes",
      slug: "kit-numerique-lyceennes",
      description:
        "Distribution d’ordinateurs et de connexion pour des lycéennes en zone rurale.",
      longDescription:
        "L’accès au numérique est une condition d’égalité des chances. Nous équipons des lycéennes identifiées avec leur établissement partenaire.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      gallery: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
      goalAmount: 800000,
      status: ProjectStatus.EN_COURS,
    },
  });

  const p3 = await prisma.project.create({
    data: {
      title: "Préparation aux examens d’État",
      slug: "preparation-examens",
      description:
        "Ateliers de méthodologie et soutien scolaire pour les candidates au HSC.",
      longDescription:
        "Sessions encadrées par des enseignantes bénévoles, supports pédagogiques et transport pris en charge pour les familles les plus modestes.",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
      gallery: [],
      goalAmount: 450000,
      status: ProjectStatus.FINANCE,
    },
  });

  await prisma.donation.create({
    data: {
      amount: 50000,
      currency: "eur",
      anonymous: false,
      donorFirstName: "Jean",
      donorLastName: "Martin",
      donorEmail: "jean@example.com",
      status: PaymentStatus.COMPLETED,
      projectId: p1.id,
      stripePaymentId: "seed_" + crypto.randomUUID(),
    },
  });

  await prisma.donation.create({
    data: {
      amount: 25000,
      anonymous: true,
      donorFirstName: "Anonyme",
      donorLastName: "",
      donorEmail: "anon@example.com",
      status: PaymentStatus.COMPLETED,
      projectId: p1.id,
      stripePaymentId: "seed_" + crypto.randomUUID(),
    },
  });

  await prisma.donation.create({
    data: {
      amount: 15000,
      anonymous: false,
      donorFirstName: "Sophie",
      donorLastName: "Laurent",
      donorEmail: "sophie@example.com",
      status: PaymentStatus.COMPLETED,
      projectId: p2.id,
      stripePaymentId: "seed_" + crypto.randomUUID(),
    },
  });

  const donPourCompte = await prisma.donation.create({
    data: {
      amount: 10000,
      anonymous: false,
      donorFirstName: donateur.firstName,
      donorLastName: donateur.lastName,
      donorEmail: donateur.email,
      userId: donateur.id,
      status: PaymentStatus.COMPLETED,
      projectId: p1.id,
      stripePaymentId: "seed_" + crypto.randomUUID(),
    },
  });

  await prisma.receipt.create({
    data: {
      number: "REC-DEMO-00001",
      userId: donateur.id,
      donationId: donPourCompte.id,
    },
  });

  await prisma.beneficiary.create({
    data: {
      firstName: "Aisha",
      lastName: "K.",
      age: 19,
      studyLevel: "Licence 2 — Sciences",
      description: "Mention très bien au baccalauréat, première de sa promotion au lycée de Port-Louis.",
      status: BeneficiaryStatus.AIDEE,
      projectId: p1.id,
    },
  });

  await prisma.beneficiary.create({
    data: {
      firstName: "Leena",
      lastName: "M.",
      age: 17,
      studyLevel: "HSC — série sciences",
      description: "Souhaite intégrer une école d’ingénieurs ; besoin d’un kit numérique.",
      status: BeneficiaryStatus.EN_ATTENTE,
      projectId: p2.id,
    },
  });

  await prisma.adminLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      details: "Jeu de données de démonstration initialisé.",
    },
  });

  console.log("Seed OK — admin: admin@fondation-jiagoo.org / Admin123!");
  console.log("Donateur test: donateur@example.com / Donateur123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
