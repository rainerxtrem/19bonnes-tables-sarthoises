/**
 * Contenu HTML mis à jour des pages "Mentions légales" et "Politique de
 * confidentialité", pour intégrer la vente de bons cadeaux (Stripe pour le
 * paiement, Resend pour l'envoi des emails). Le contenu de départ est repris
 * verbatim de ce qui était déjà publié en base (rédigé depuis /admin/pages
 * par l'association) : seuls des ajouts ont été insérés, rien n'a été retiré
 * ni reformulé.
 *
 * Fichier sans effet de bord (pas de PrismaClient) — utilisé une seule fois
 * par une route de debug temporaire pour mettre à jour la prod, puis
 * réutilisable si besoin de repasser dessus.
 */

export const MENTIONS_LEGALES_CONTENT = `
<p><em>Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), il est porté à la connaissance des utilisateurs et visiteurs du site les présentes mentions légales.</em></p>
<h2>Éditeur du site</h2>
<p>Le site 19bonnes-tables-sarthoises.fr est édité par :</p>
<ul>
<li><p><strong>Nom :</strong> Association des 19 Bonnes Tables Sarthoises</p></li>
<li><p><strong>Forme juridique :</strong> Association loi 1901</p></li>
<li><p><strong>Siège social :</strong> 25 place de l'Église - 72560 Changé</p></li>
<li><p><strong>Numéro SIRET :</strong> 388 035 735 00017</p></li>
<li><p><strong>Numéro RNA (Répertoire National des Associations) :</strong> W721002051</p></li>
<li><p><strong>Email :</strong> <a target="_blank" rel="noopener noreferrer nofollow" href="mailto:contact@19bonnes-tables-sarthoises.fr">contact@19bonnes-tables-sarthoises.fr</a></p></li>
<li><p><strong>Directeur de la publication :</strong> M. BLAIS Baptiste - Webmaster externe</p></li>
</ul>
<h2>Hébergement</h2>
<p>Le site est hébergé par :</p>
<ul>
<li><p><strong>Railway Corporation</strong></p></li>
<li><p>548 Market St PMB 68956, San Francisco, California 94104, États-Unis</p></li>
<li><p>Site web : <a target="_blank" rel="noopener noreferrer" href="https://railway.com">railway.com</a></p></li>
</ul>
<h2>Conception et développement</h2>
<p>Le site a été développé pour le compte de l'association des 19 Bonnes Tables Sarthoises.</p>
<h2>Vente en ligne de bons cadeaux</h2>
<p>Le site permet l'achat en ligne de bons cadeaux, utilisables dans les restaurants membres de l'association. Ces ventes sont encadrées par nos <a href="/cgv">conditions générales de vente</a>, que tout acheteur est réputé avoir acceptées avant de finaliser sa commande. Les paiements par carte bancaire sont traités par notre prestataire de paiement <strong>Stripe</strong>, qui ne transmet à l'Association aucune donnée bancaire.</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble des éléments présents sur ce site (textes, photographies, logos, mise en page, structure) est protégé par le droit d'auteur et le droit des marques. Les photographies des restaurants membres restent la propriété de leurs établissements respectifs ou de l'association.</p>
<p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de l'association, sauf mention contraire ou usage strictement personnel et non commercial.</p>
<h2>Liens hypertextes</h2>
<p>Le site peut contenir des liens hypertextes vers les sites internet des restaurants membres et de partenaires. L'association n'exerce aucun contrôle sur ces sites tiers et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques en matière de données personnelles.</p>
<h2>Données personnelles</h2>
<p>Le traitement des données personnelles collectées via ce site (formulaire de contact, achat de bons cadeaux) est détaillé dans notre <a target="_blank" rel="noopener noreferrer nofollow" href="/politique-de-confidentialite">politique de confidentialité</a>. Les conditions de vente des bons cadeaux sont détaillées dans nos <a href="/cgv">conditions générales de vente</a>.</p>
<h2>Droit applicable</h2>
<p>Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de résolution amiable, les tribunaux français seront seuls compétents.</p>
<p><em>Dernière mise à jour : 06/09/2026</em></p>
`.trim();

export const POLITIQUE_CONFIDENTIALITE_CONTENT = `
<p>La présente politique de confidentialité décrit comment l'association des 19 Bonnes Tables Sarthoises collecte, utilise et protège les données personnelles des visiteurs et utilisateurs du site 19bonnes-tables-sarthoises.fr, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.</p>
<h2>Responsable du traitement</h2>
<p>Le responsable du traitement des données est l'association des 19 Bonnes Tables Sarthoises, joignable à l'adresse <a target="_blank" rel="noopener noreferrer nofollow" href="mailto:contact@19bonnes-tables-sarthoises.fr">contact@19bonnes-tables-sarthoises.fr</a>.</p>
<h2>Données collectées</h2>
<p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du site :</p>
<ul>
<li><p><strong>Formulaire de contact :</strong> nom, adresse email, numéro de téléphone (facultatif), objet et contenu de votre message.</p></li>
<li><p><strong>Achat d'un bon cadeau :</strong> nom et adresse email de l'acheteur et, si le bon cadeau est destiné à une autre personne, nom et adresse email du bénéficiaire. Le paiement lui-même (numéro de carte bancaire, etc.) est saisi et traité directement par notre prestataire Stripe, qui ne le transmet jamais à l'Association.</p></li>
<li><p><strong>Comptes d'administration :</strong> pour les les restaurateurs membres disposant d'un accès à l'espace d'administration : nom, adresse email et mot de passe (stocké de façon chiffrée, jamais en clair).</p></li>
<li><p><strong>Données techniques :</strong> un cookie de session strictement nécessaire est déposé uniquement lors de la connexion à l'espace d'administration, afin de vous maintenir connecté. Voir la section "Cookies" ci-dessous.</p></li>
</ul>
<p>Nous ne collectons aucune donnée bancaire ni aucune donnée sensible au sens du RGPD.</p>
<h2>Finalités du traitement</h2>
<ul>
<li><p>Répondre à vos demandes envoyées via le formulaire de contact ;</p></li>
<li><p>Traiter l'achat d'un bon cadeau, l'envoyer par email et suivre sa date de validité (y compris les rappels avant expiration) ;</p></li>
<li><p>Gérer les accès sécurisés à l'espace d'administration du site ;</p></li>
<li><p>Assurer la sécurité et le bon fonctionnement du site (prévention du spam, notamment via un mécanisme de type "pot de miel" invisible et une limitation du nombre de requêtes).</p></li>
</ul>
<h2>Base légale</h2>
<p>Le traitement de vos données via le formulaire de contact repose sur votre consentement explicite, recueilli au moyen de la case à cocher prévue à cet effet. Le traitement des données liées à l'achat d'un bon cadeau repose sur l'exécution du contrat de vente conclu au moment de la commande (voir nos <a href="/cgv">conditions générales de vente</a>). Le traitement des données des comptes d'administration repose sur l'exécution des missions associatives des personnes concernées.</p>
<h2>Durée de conservation</h2>
<ul>
<li><p>Les messages envoyés via le formulaire de contact sont conservés 3 ans à compter du dernier échange, sauf demande de suppression anticipée de votre part.</p></li>
<li><p>Les données liées à l'achat d'un bon cadeau (identité de l'acheteur et, le cas échéant, du bénéficiaire, montant, statut) sont conservées 10 ans à compter de la vente, conformément à l'obligation légale de conservation des documents comptables (article L123-22 du Code de commerce).</p></li>
<li><p>Les comptes d'administration sont conservés tant que leur titulaire exerce une fonction au sein de l'association ou gère un restaurant membre, puis supprimés.</p></li>
</ul>
<h2>Destinataires des données</h2>
<p>Vos données ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales. Elles sont accessibles uniquement aux membres habilités de l'association (bureau, administrateurs du site) et, pour les besoins strictement nécessaires décrits ci-dessous, à nos prestataires techniques.</p>
<p>Pour le paiement des bons cadeaux, les données nécessaires (nom, email, montant) sont transmises à notre prestataire de paiement <strong>Stripe</strong> (Stripe Payments Europe, Limited). Pour l'envoi de nos emails (confirmation d'achat, bon cadeau au format PDF, rappels avant expiration, newsletter), nous utilisons le prestataire <strong>Resend</strong>. Ces prestataires agissent en tant que sous-traitants au sens du RGPD et n'utilisent vos données à aucune autre fin que celle pour laquelle elles leur sont transmises.</p>
<p>Le site est hébergé par Railway Corporation (États-Unis) — voir nos <a target="_blank" rel="noopener noreferrer nofollow" href="/mentions-legales">mentions légales</a>. Ce transfert hors de l'Union Européenne est encadré par les garanties prévues par l'hébergeur pour assurer un niveau de protection adéquat de vos données.</p>
<h2>Sécurité</h2>
<p>Les mots de passe des comptes d'administration sont stockés sous forme chiffrée (hachage). Les échanges avec le site sont sécurisés par le protocole HTTPS. Des mesures raisonnables sont mises en œuvre pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés.</p>
<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
<ul>
<li><p>Droit d'accès et de rectification ;</p></li>
<li><p>Droit à l'effacement ("droit à l'oubli") ;</p></li>
<li><p>Droit d'opposition et de limitation du traitement ;</p></li>
<li><p>Droit à la portabilité de vos données.</p></li>
</ul>
<p>Pour exercer ces droits, contactez nous à l'adresse <a target="_blank" rel="noopener noreferrer nofollow" href="mailto:contact@19bonnes-tables-sarthoises.fr">contact@19bonnes-tables-sarthoises.fr</a>. Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) — <a target="_blank" rel="noopener noreferrer" href="https://www.cnil.fr">www.cnil.fr</a>.</p>
<h2>Cookies</h2>
<p>Ce site utilise uniquement, à ce jour, un cookie technique strictement nécessaire à l'authentification sur l'espace d'administration. Ce type de cookie est exempté de consentement par la réglementation, car indispensable au fonctionnement du service demandé.</p>
<p>Aucun cookie de mesure d'audience, publicitaire ou de traçage n'est déposé sans votre consentement préalable, recueilli via le bandeau affiché lors de votre première visite. Si de tels outils venaient à être ajoutés à l'avenir, cette politique serait mise à jour en conséquence et votre consentement vous serait à nouveau demandé.</p>
<p><em>Dernière mise à jour : 06/09/2026</em></p>
`.trim();
