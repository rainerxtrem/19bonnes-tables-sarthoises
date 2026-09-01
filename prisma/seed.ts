/**
 * Seed basé sur l'audit du site B12 existant (19bonnes-tables-sarthoises.fr).
 * Toutes les données ci-dessous sont reprises verbatim du site actuel ou de
 * ses métadonnées ; rien n'a été inventé. Quand une information n'était pas
 * disponible (ex. horaires précis, coordonnées de l'Hôtel La Renaissance),
 * le champ est laissé vide/null plutôt que complété arbitrairement — voir
 * les commentaires "TODO audit" pour la liste de ce qu'il reste à compléter
 * manuellement depuis /admin après le premier déploiement.
 *
 * Les photos ne sont PAS migrées automatiquement par ce script (elles vivent
 * sur cdn.b12.io, propriété de B12) : les albums et fiches restaurants sont
 * créés sans image, à compléter via /admin en uploadant les photos
 * récupérées manuellement avant la coupure de B12.
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Day = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
type Slot = { start: string; end: string };
type OpeningHours = { day: Day; closed: boolean; slots: Slot[] }[];

const ALL_DAYS: Day[] = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

function hours(open: Partial<Record<Day, Slot[]>>): OpeningHours {
  return ALL_DAYS.map((day) => ({
    day,
    closed: !open[day] || open[day]!.length === 0,
    slots: open[day] ?? [],
  }));
}

async function main() {
  // ---------------------------------------------------------------------
  // Compte super-administrateur initial
  // ---------------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@19bonnestablessarthoises.fr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme-au-premier-lancement";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrateur",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✔ Compte SUPER_ADMIN prêt : ${adminEmail}`);

  // ---------------------------------------------------------------------
  // Paramètres du site
  // ---------------------------------------------------------------------
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "19 Bonnes Tables Sarthoises",
      siteDescription:
        "Association d'hommes et de femmes de métiers. Le savoir-faire pour mieux vous servir.",
      contactEmail: "contact@19bonnestablessarthoises.fr",
      // TODO audit : téléphone et adresse de l'association absents de l'ancien site.
      seoDefaultTitle: "19 Bonnes Tables Sarthoises",
      seoDefaultDescription:
        "L'association des 19 Bonnes Tables Sarthoises, plus vieille association culinaire de France, réunit des restaurateurs passionnés en Sarthe.",
      footerText: null,
    },
  });
  console.log("✔ Paramètres du site créés");

  // ---------------------------------------------------------------------
  // Page d'accueil (hero + section "à propos")
  // ---------------------------------------------------------------------
  await prisma.page.upsert({
    where: { slug: "accueil" },
    update: {},
    create: {
      slug: "accueil",
      title: "19 Bonnes Tables Sarthoises",
      excerpt: "Association d'hommes et de femmes de métiers. Le savoir-faire pour mieux vous servir.",
      content:
        "<p>L'association des 19 Bonnes Tables Sarthoises, plus vieille association culinaire de France, réunit des restaurateurs passionnés qui s'engagent à offrir une cuisine authentique et savoureuse, mettant en valeur les produits frais et locaux de la région pour garantir la meilleure expérience culinaire à leurs clients.</p>",
      status: "PUBLISHED",
      publishedAt: new Date(),
      isSystem: true,
    },
  });

  // Pages légales — contenu à rédiger et publier depuis /admin (voir audit,
  // section 11 : ces pages n'existaient pas du tout sur l'ancien site).
  for (const legal of [
    { slug: "mentions-legales", title: "Mentions légales" },
    { slug: "politique-de-confidentialite", title: "Politique de confidentialité" },
  ]) {
    await prisma.page.upsert({
      where: { slug: legal.slug },
      update: {},
      create: {
        slug: legal.slug,
        title: legal.title,
        content: `<p><em>Contenu à compléter depuis /admin/pages avant la mise en production (forme juridique de l'association, SIRET, hébergeur, responsable de publication, politique de cookies, etc.).</em></p>`,
        status: "DRAFT",
        isSystem: true,
      },
    });
  }

  await prisma.page.upsert({
    where: { slug: "bon-cadeaux" },
    update: {},
    create: {
      slug: "bon-cadeaux",
      title: "Bons cadeaux",
      content: `
        <p><strong>Pensez aux chèques cadeaux pour toutes vos occasions ! 🎁</strong></p>
        <p>Vous manquez d'idées pour un cadeau ? Simplifiez-vous la vie et faites plaisir à coup sûr avec nos chèques cadeaux !</p>
        <ul>
          <li>Polyvalents : ils conviennent à toutes les occasions – anniversaires, mariages, fêtes, ou juste pour dire merci.</li>
          <li>Liberté de choix : offrez à vos proches la possibilité de choisir le restaurant qui leur fera vraiment plaisir ! (Bons cadeaux valables dans tous les restaurants membres)</li>
          <li>Rapides et pratiques : une solution simple pour ne jamais être à court d'inspiration.</li>
        </ul>
        <h3>Comment l'obtenir ?</h3>
        <p>En contactant l'association directement depuis notre site dans la rubrique "Contactez-nous" ou bien par téléphone au 02 43 40 42 08 sur les horaires d'ouverture (Restaurant "Le Cheval Blanc").</p>
      `,
      status: "PUBLISHED",
      publishedAt: new Date(),
      isSystem: true,
    },
  });
  console.log("✔ Pages créées (accueil, bons cadeaux, pages légales en brouillon)");

  // ---------------------------------------------------------------------
  // Restaurants (10 fiches, données extraites de l'audit du site B12)
  // ---------------------------------------------------------------------
  const restaurants: Array<Prisma.RestaurantCreateInput & { slug: string }> = [
    {
      slug: "le-cheval-blanc",
      name: "Le Cheval Blanc",
      shortDescription: "Restaurant, réceptions, repas de famille et séminaires.",
      description:
        "<p>Vous accueille au Cheval Blanc à Changé à proximité du Mans, venez découvrir une carte de saison raffinée. Dans un cadre chaleureux au coin de la cheminée ou dans un coin de verdure quand les beaux jours arrivent.</p><p>Restaurant, réceptions, repas de famille et séminaires.</p>",
      additionalInfo: "Salle privative jusqu'à 90 personnes. Salon privé 25 personnes. Terrasse.",
      address: "25 place de l'église",
      postalCode: "72560",
      city: "Changé",
      phone: "02.43.40.42.08",
      email: "contact@lechevalblanc72.fr",
      website: "https://lechevalblanc72.fr",
      priceLunch: "19€",
      priceDinner: "50€",
      openingHours: hours({
        mardi: [{ start: "12:00", end: "14:00" }],
        mercredi: [{ start: "12:00", end: "14:00" }],
        jeudi: [{ start: "12:00", end: "14:00" }],
        vendredi: [{ start: "12:00", end: "14:00" }, { start: "19:00", end: "21:00" }],
        samedi: [{ start: "12:00", end: "14:00" }, { start: "19:00", end: "21:00" }],
        dimanche: [{ start: "12:00", end: "14:00" }],
      }) as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 1,
    },
    {
      slug: "le-jardin-gourmand",
      name: "Le Jardin Gourmand",
      shortDescription: "Cuisine simple, autour des produits de saison, dans un cadre chaleureux et original.",
      // TODO audit : aucune coordonnée ni horaire disponible sur l'ancien site pour cette fiche.
      priceLunch: "15€",
      priceDinner: "35€",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 2,
    },
    {
      slug: "l-insouciant",
      name: "L'insouciant",
      shortDescription: "Gastronomie décomplexée associée au voyage culinaire.",
      description:
        "<p>Gastronomie décomplexée. L'insouciant vous propose un voyage culinaire haut en saveur. Corentin Courtien et son équipe œuvrent à respecter la nature et les saisons. Les produits sont sourcés en direct ou avec très peu d'intermédiaire. Le chef sublime les matières brutes de notre beau terroir français.</p><p>En salle, un esprit épuré et chaleureux. Un service bienveillant, rigoureux, à votre écoute.</p>",
      additionalInfo: "Terrasse.",
      address: "6 Rue de la Mission",
      postalCode: "72000",
      city: "Le Mans",
      phone: "02 43 40 00 58",
      email: "restaurant-linsouciant@orange.fr",
      website: "https://www.restaurant-linsouciant.fr/",
      priceLunch: "30€",
      priceDinner: "70€",
      openingHours: hours({
        mardi: [{ start: "12:00", end: "13:30" }],
        mercredi: [{ start: "12:00", end: "13:30" }, { start: "19:00", end: "21:30" }],
        jeudi: [{ start: "12:00", end: "13:30" }, { start: "19:00", end: "21:30" }],
        vendredi: [{ start: "12:00", end: "13:30" }, { start: "19:00", end: "21:30" }],
        samedi: [{ start: "12:00", end: "13:30" }, { start: "19:00", end: "21:30" }],
      }) as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 3,
    },
    {
      slug: "les-etangs-de-guibert",
      name: "Les étangs de Guibert",
      shortDescription: "Hôtel et restaurant de charme.",
      description:
        "<p>Une grande ferme rénovée au pied de la forêt de Perseigne. 8 ha d'étangs riches en truite et en saumon. Hôtel et restaurant de charme. 3 salles de 30 à 140 couverts. Cheminée - Terrasse avec vue sur l'étang - Bois et parking privé.</p>",
      additionalInfo:
        "Fermeture hebdomadaire : Hiver (mi-septembre à mi-mars) dimanche soir et lundi — Été (mi-mars à mi-septembre) dimanche soir. Dernière heure d'accueil : 14h le midi et 21h30 le soir.",
      address: "Route des Etangs de Guibert",
      postalCode: "72600",
      city: "Neufchâtel-en-Saosnois",
      phone: "02.43.97.15.38",
      email: "contact@lesetangsdeguibert.fr",
      // TODO audit : lien affiché (lesetangsdeguibert.com) différent du href réel (mort) — à confirmer avec le restaurant.
      website: "https://www.lesetangsdeguibert.com/",
      priceLunch: "26€",
      priceDinner: "45€",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 4,
    },
    {
      slug: "l-ardoise",
      name: "L'ardoise",
      address: "7 rue Carnot",
      postalCode: "72270",
      city: "Malicorne-Sur-Sarthe",
      phone: "02 43 94 53 56",
      email: "lardoise.malicorne@gmail.com",
      website: "http://www.resto-bistro-lardoise.com/",
      // TODO audit : tarifs affichés à "00€" sur l'ancien site (non renseignés) — à compléter.
      openingHours: hours({
        lundi: [{ start: "12:00", end: "13:45" }],
        mardi: [{ start: "12:00", end: "13:45" }],
        jeudi: [{ start: "12:00", end: "13:45" }],
        vendredi: [{ start: "12:00", end: "13:45" }, { start: "19:00", end: "21:00" }],
        samedi: [{ start: "12:00", end: "13:45" }, { start: "19:00", end: "21:00" }],
        dimanche: [{ start: "12:00", end: "14:00" }],
      }) as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 5,
    },
    {
      slug: "la-petite-auberge",
      name: "La petite Auberge",
      shortDescription:
        "L'auberge des Frères Plé propose une cuisine française raffinée, savoureuse et tendance, dans une ambiance détendue et conviviale.",
      description:
        "<p>Situé à 17 km du Mans sur la commune de Saint-Jean-d'Assé, le restaurant La Petite Auberge vous accueille depuis 15 ans. L'auberge est tenue par les Frères Plé, dont l'un est cuisinier.</p>",
      additionalInfo:
        "3 salles de 10 à 100 couverts. TODO audit : horaires affichés sur l'ancien site (09h00–17h00 tous les jours) semblaient être une erreur de saisie — à vérifier avec le restaurant avant publication.",
      address: "14 route Nationale",
      postalCode: "72380",
      city: "Saint Jean d'Assé",
      phone: "02.43.25.25.15",
      website: "https://auberge-restaurant-traiteur.fr",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 6,
    },
    {
      slug: "le-panier-fleuri",
      name: "Le Panier Fleuri",
      shortDescription: "Cuisine exigeante, alliant plats traditionnels et créations innovantes dans un cadre chaleureux.",
      additionalInfo: "Dernière heure d'accueil : 15h le midi et 21h00 le soir.",
      address: "1 Av. de Bretagne",
      postalCode: "72160",
      city: "Sceaux-sur-Huisne",
      phone: "02 43 93 40 08",
      website: "http://www.restaurant-le-panier-fleuri-sceaux-sur-huisne.fr/",
      facebookUrl: "https://www.facebook.com/restaurantlepanierfleuri",
      priceLunch: "15€",
      priceDinner: "45€",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 7,
    },
    {
      slug: "hotel-restaurant-la-renaissance",
      name: "Hôtel Restaurant La Renaissance",
      // TODO audit : aucune coordonnée trouvée sur l'ancien site (adresse, téléphone, email, site web) — recherche externe nécessaire avant publication.
      priceLunch: "16€",
      priceDinner: "35€",
      status: "DRAFT",
      order: 8,
    },
    {
      slug: "les-tables-de-la-fontaine",
      name: "Les Tables de la Fontaine",
      shortDescription: "Le chef Olivier Dabet sublime des produits de saison avec raffinement pour « taquiner les papilles ».",
      description:
        "<p>« Taquiner les papilles » est la devise du chef Olivier Dabet. N'attendez pas plus longtemps, venez vivre une expérience gastronomique dans un cadre chaleureux et une atmosphère feutrée.</p>",
      address: "Château de Belair, 1 Lieu Dit",
      postalCode: "72330",
      city: "Cérans-Foulletourte",
      phone: "02 43 87 18 18",
      website: "https://www.les-tables-de-la-fontaine.fr/",
      priceDinner: "55€",
      openingHours: hours({
        mardi: [{ start: "19:00", end: "20:30" }],
        mercredi: [{ start: "19:00", end: "20:30" }],
        jeudi: [{ start: "19:00", end: "20:30" }],
        vendredi: [{ start: "19:00", end: "20:30" }],
        samedi: [{ start: "19:00", end: "20:30" }],
        dimanche: [{ start: "12:00", end: "13:30" }],
      }) as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 9,
    },
    {
      slug: "les-jardins-de-marolles",
      name: "Les Jardins de Marolles",
      shortDescription: "Amoureux de la cuisine française, nous mettons à l'honneur des classiques culinaires.",
      description:
        "<p>Les Jardins de Marolles, situés au cœur de Marolles-les-Braults, proposent une cuisine française simple, raffinée et entièrement faite maison. À partir de produits frais et locaux, le Chef David Sechet revisite les grands classiques avec créativité.</p>",
      address: "11 Place Henri Coutard",
      postalCode: "72260",
      city: "Marolles-les-Braults",
      phone: "02 43 97 41 06",
      website: "https://www.lesjardinsdemarolles.fr/",
      priceDinner: "55€",
      openingHours: hours({
        lundi: [{ start: "12:00", end: "13:30" }],
        mardi: [{ start: "12:00", end: "13:30" }],
        jeudi: [{ start: "12:00", end: "13:30" }],
        vendredi: [{ start: "12:00", end: "13:30" }, { start: "19:15", end: "21:15" }],
        samedi: [{ start: "12:00", end: "13:30" }, { start: "19:15", end: "21:15" }],
        dimanche: [{ start: "12:00", end: "13:30" }],
      }) as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 10,
    },
  ];

  const restaurantBySlug = new Map<string, string>();
  for (const data of restaurants) {
    const { slug, ...rest } = data;
    const restaurant = await prisma.restaurant.upsert({
      where: { slug },
      update: {},
      create: { slug, ...rest },
    });
    restaurantBySlug.set(slug, restaurant.id);

    // Album galerie vide associé (redirection /galerie-{slug} -> /galerie/{slug}
    // déjà en place dans next.config.ts) — photos à uploader depuis /admin.
    await prisma.galleryAlbum.upsert({
      where: { slug },
      update: {},
      create: { slug, title: restaurant.name, restaurantId: restaurant.id, order: restaurant.order },
    });
  }
  console.log(`✔ ${restaurants.length} restaurants créés (voir commentaires TODO audit pour les données manquantes)`);

  // ---------------------------------------------------------------------
  // Bureau de l'association
  // ---------------------------------------------------------------------
  const boardMembers: { firstName: string; lastName: string; role: string; restaurantSlug?: string; order: number }[] = [
    { firstName: "Gaëtan", lastName: "Cledic", role: "Président de l'association", restaurantSlug: "le-cheval-blanc", order: 1 },
    { firstName: "Romuald", lastName: "Lachater", role: "Vice-président", restaurantSlug: "le-panier-fleuri", order: 2 },
    { firstName: "Sébastien", lastName: "Plé", role: "Trésorier", restaurantSlug: "la-petite-auberge", order: 3 },
    { firstName: "Thierry", lastName: "Robin", role: "Trésorier adjoint", order: 4 },
    { firstName: "Madeline", lastName: "Courtien", role: "Secrétaire", restaurantSlug: "l-insouciant", order: 5 },
    { firstName: "Laeticia", lastName: "Lachater", role: "Secrétaire Adjoint", restaurantSlug: "le-panier-fleuri", order: 6 },
  ];

  for (const member of boardMembers) {
    const existing = await prisma.boardMember.findFirst({
      where: { firstName: member.firstName, lastName: member.lastName },
    });
    if (existing) continue;
    await prisma.boardMember.create({
      data: {
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        order: member.order,
        restaurantId: member.restaurantSlug ? restaurantBySlug.get(member.restaurantSlug) : undefined,
      },
    });
  }
  console.log(`✔ ${boardMembers.length} membres du bureau créés`);

  // ---------------------------------------------------------------------
  // Partenaires
  // ---------------------------------------------------------------------
  const partners = [
    {
      name: "Poulet de Loué",
      description:
        "Depuis 1969, l'Association des 19 Bonnes Tables Sarthoises collabore avec les producteurs de poulets de Loué, et nos chefs créent des recettes à base de leurs volailles.",
      order: 1,
    },
    { name: "Metro", description: null, order: 2 },
  ];
  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: partner.name } });
    if (!existing) {
      await prisma.partner.create({ data: partner });
    }
  }
  console.log(`✔ ${partners.length} partenaires créés (logos à uploader depuis /admin)`);

  // ---------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------
  const bonCadeauxPage = await prisma.page.findUnique({ where: { slug: "bon-cadeaux" } });

  const navItems: { label: string; linkType: "INTERNAL" | "EXTERNAL"; url?: string; pageId?: string; order: number }[] = [
    { label: "Accueil", linkType: "INTERNAL", url: "/", order: 1 },
    { label: "Bons cadeaux", linkType: "INTERNAL", pageId: bonCadeauxPage?.id, order: 2 },
    { label: "Le bureau", linkType: "INTERNAL", url: "/le-bureau", order: 3 },
    { label: "Galerie", linkType: "INTERNAL", url: "/galerie", order: 4 },
    { label: "Partenaires", linkType: "INTERNAL", url: "/partenaires", order: 5 },
    { label: "Actualités", linkType: "INTERNAL", url: "/actualites", order: 6 },
    { label: "Contact", linkType: "INTERNAL", url: "/contact", order: 7 },
  ];

  for (const item of navItems) {
    const existing = await prisma.navigationItem.findFirst({ where: { label: item.label, parentId: null } });
    if (!existing) {
      await prisma.navigationItem.create({
        data: {
          label: item.label,
          linkType: item.linkType,
          url: item.url,
          pageId: item.pageId,
          order: item.order,
        },
      });
    }
  }
  console.log("✔ Navigation principale créée");

  console.log("\nSeed terminé. Connectez-vous sur /admin/login avec :");
  console.log(`  Email : ${adminEmail}`);
  console.log(`  Mot de passe : ${adminPassword}`);
  console.log("⚠ Changez ce mot de passe immédiatement après la première connexion.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
