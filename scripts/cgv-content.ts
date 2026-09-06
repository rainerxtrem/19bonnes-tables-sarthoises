/**
 * Contenu HTML de la page CGV (slug "cgv"), partagé entre :
 * - scripts/create-cgv-page.ts (script ponctuel exécuté contre la prod)
 * - prisma/seed.ts (pour que tout nouvel environnement l'ait aussi)
 * Fichier sans effet de bord (pas de PrismaClient ici) pour rester
 * importable en toute sécurité depuis les deux.
 */
export const CGV_CONTENT = `
<h2>Article 1 — Objet</h2>
<p>Les présentes conditions générales de vente (CGV) s'appliquent à toute commande de bon cadeau passée sur le site
<strong>19bonnes-tables-sarthoises.fr</strong>, édité par l'association <strong>19 Bonnes Tables Sarthoises</strong>,
association loi 1901 (ci-après « l'Association »). Toute commande implique l'acceptation sans réserve des présentes CGV.</p>

<h2>Article 2 — Produits proposés</h2>
<p>L'Association propose à la vente des bons cadeaux dématérialisés, utilisables exclusivement dans les restaurants
membres de l'association participant à l'opération. La liste des restaurants participants est consultable sur la page
<a href="/nos-restaurants">Nos restaurants</a> et peut évoluer dans le temps.</p>

<h2>Article 3 — Prix et paiement</h2>
<p>Les prix des bons cadeaux sont indiqués en euros, toutes taxes comprises. Le paiement s'effectue en ligne, en une
seule fois, par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>. L'Association ne conserve à aucun
moment les coordonnées bancaires du client.</p>
<p>La commande n'est considérée comme définitive qu'après confirmation du paiement par Stripe et envoi du bon cadeau
par email au format PDF.</p>

<h2>Article 4 — Livraison</h2>
<p>Le bon cadeau est un produit numérique : il est délivré exclusivement par email, sous forme de fichier PDF, à
l'adresse indiquée lors de la commande (achat pour soi-même ou pour un tiers bénéficiaire). Aucune livraison physique
n'est proposée.</p>

<h2>Article 5 — Validité et utilisation</h2>
<p>Chaque bon cadeau est valable <strong>12 mois</strong> à compter de sa date d'achat. Cette date de fin de validité
figure sur le bon cadeau. Passé ce délai, le bon cadeau ne peut plus être utilisé et ne donne lieu à aucun
remboursement ni prolongation, sauf disposition légale contraire.</p>
<p>Le bon cadeau doit être présenté (au format papier ou numérique) directement au restaurant membre choisi par le
bénéficiaire, qui procède à sa validation. Il peut être utilisé en une seule fois, pour tout ou partie de sa valeur ;
il n'est pas rendu la monnaie sur un solde non utilisé, sauf si la réglementation applicable l'impose.</p>

<h2>Article 6 — Droit de rétractation</h2>
<p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux biens
confectionnés selon les spécifications du consommateur ou nettement personnalisés, ni aux bons d'achat une fois
ceux-ci délivrés. Le client dispose toutefois d'un délai de rétractation de 14 jours à compter de l'achat pour toute
demande d'annulation, <strong>tant que le bon cadeau n'a pas été utilisé</strong> auprès d'un restaurant membre.
Toute demande est à adresser par email à l'Association (voir Article 9).</p>

<h2>Article 7 — Responsabilité</h2>
<p>L'Association agit en tant qu'intermédiaire entre l'acheteur et les restaurants membres. La prestation
(repas, service) relève de la seule responsabilité du restaurant qui accueille le bénéficiaire du bon cadeau.
L'Association ne saurait être tenue responsable d'un désagrément survenu lors de la prestation elle-même
(qualité du repas, disponibilité, réservation, etc.).</p>

<h2>Article 8 — Données personnelles</h2>
<p>Les données collectées lors de la commande (nom, email, éventuellement nom du bénéficiaire) sont utilisées
uniquement pour la gestion de la commande et l'envoi du bon cadeau. Pour en savoir plus, consultez notre
<a href="/politique-de-confidentialite">politique de confidentialité</a>.</p>

<h2>Article 9 — Service client et réclamations</h2>
<p>Pour toute question relative à une commande, un remboursement ou une réclamation, le client peut contacter
l'Association via la page <a href="/contact">Contact</a> du site.</p>

<h2>Article 10 — Médiation</h2>
<p>Conformément aux articles L616-1 et R616-1 du Code de la consommation, tout consommateur a le droit de recourir
gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige, après démarche écrite
préalable auprès de l'Association restée infructueuse.</p>

<h2>Article 11 — Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les
tribunaux français seront seuls compétents.</p>

<p><em>Dernière mise à jour : à compléter/adapter depuis l'administration du site (informations juridiques précises
de l'Association, coordonnées du médiateur de la consommation compétent, etc.).</em></p>
`.trim();
