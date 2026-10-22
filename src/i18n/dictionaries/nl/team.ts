import type { team as en } from "../en/team";

export const team: typeof en = {
  title: "Team",
  description: "Wie kan inloggen in je werkruimte, en wat mogen ze doen.",
  members: "Leden",
  membersText: "Omzet en instellingen blijven privé tenzij je er toegang toe geeft.",
  member: "Lid",
  role: "Rol",
  staffProfile: "Medewerkersprofiel",
  you: "(jij)",
  customAccess: "Aangepaste toegang",
  linked: "Gekoppeld",
  remove: (name) => `${name} verwijderen`,
  removeTitle: (name) => `${name} verwijderen?`,
  removeText:
    "Deze persoon kan niet meer inloggen in deze werkruimte. Het medewerkersprofiel en de afsprakengeschiedenis blijven bewaard.",
  removeConfirm: "Toegang intrekken",
  invite: "Iemand uitnodigen",
  inviteText:
    "Ze maken een login aan (of gebruiken hun bestaande) en komen erbij met de rol die jij kiest.",
  pending: "Openstaande uitnodigingen",
  noPending: "Geen openstaande uitnodigingen.",
  staffProfileLower: "medewerkersprofiel",
  expires: (date) => `vervalt op ${date}`,
  revoke: (email) => `Uitnodiging voor ${email} intrekken`,
  form: {
    ready: "Uitnodiging klaar",
    link: "Uitnodigingslink",
    email: "E-mailadres",
    linkStaff: "Koppelen aan medewerkersprofiel",
    linkStaffHint: "Ze zien de agenda en klanten van deze medewerker als die van henzelf.",
    noStaff: "Geen medewerkersprofiel",
    create: "Uitnodiging aanmaken",
    access: "Toegang",
    accessFor: (name) => `Toegang voor ${name}`,
    accessText: "Kies een rol en stel daarna de afzonderlijke rechten fijn af.",
    ownersAll: "Eigenaars hebben altijd alle rechten.",
    permissions: "Rechten",
    inRole: "Inbegrepen in deze rol",
    permissionsPro:
      "Eigen rechten per teamlid zitten in Pro. In Basic krijgt iedereen de standaardrechten van de rol.",
    save: "Toegang opslaan",
  },
  permissions: {
    "settings.manage":
      "Het profiel, de huisstijl, vestigingen, openingsuren en boekingsregels van de zaak bewerken",
    "members.manage": "Teamleden uitnodigen en hun rollen en rechten wijzigen",
    "staff.manage": "Alle medewerkersprofielen, roosters en afwezigheden beheren",
    "schedule.manage_own": "Je eigen werkuren en afwezigheden beheren",
    "services.manage": "Behandelingen, categorieën en prijzen aanmaken en bewerken",
    "appointments.view_all": "Alle afspraken van de zaak bekijken",
    "appointments.view_own": "Afspraken bekijken die aan jou zijn toegewezen",
    "appointments.manage_all": "Elke afspraak aanmaken, verplaatsen en bijwerken",
    "appointments.manage_own": "Afspraken bijwerken die aan jou zijn toegewezen",
    "customers.view": "Alle klantgegevens bekijken",
    "customers.manage": "Klantgegevens aanmaken, bewerken, exporteren en verwijderen",
    "customers.notes": "Privénotities over klanten lezen en schrijven",
    "products.manage": "Verkoopproducten beheren",
    "inventory.manage": "Voorraad aanpassen",
    "orders.manage": "Webshopbestellingen bekijken en verwerken",
    "finance.view": "Omzet, uitgaven en financiële overzichten bekijken",
    "finance.manage": "Uitgaven en financiële transacties registreren",
    "reports.view": "Rapporten van de zaak bekijken",
    "billing.manage": "Het NORYX-abonnement en de factuurgegevens beheren",
    "audit.view": "De auditlog van de zaak bekijken",
  },
  invited: (email) =>
    `Uitnodiging aangemaakt voor ${email}. E-mail is nog niet ingesteld, dus deel deze link zelf. Ze vervalt over 7 dagen.`,
  accessUpdated: "Toegang bijgewerkt.",
  errors: {
    invite: "Je hebt geen toestemming om teamleden uit te nodigen.",
    inviteFailed: "De uitnodiging kon niet aangemaakt worden.",
    change: "Je hebt geen toestemming om teamleden te wijzigen.",
    chooseRole: "Kies een rol.",
    saveFailed: "De wijzigingen konden niet opgeslagen worden.",
    rpc: {
      already_member: "Deze persoon maakt al deel uit van je team.",
      staff_already_linked: "Dat medewerkersprofiel is al aan een andere login gekoppeld.",
      "You do not have permission to invite team members":
        "Je hebt geen toestemming om teamleden uit te nodigen.",
      "Only owners can invite another owner":
        "Alleen eigenaars kunnen een andere eigenaar uitnodigen.",
      "You do not have permission to change this member":
        "Je hebt geen toestemming om dit lid te wijzigen.",
      "You cannot change your own role or permissions":
        "Je kunt je eigen rol of rechten niet wijzigen.",
      "Only owners can change owners": "Alleen eigenaars kunnen eigenaars wijzigen.",
      "You can only grant permissions you have yourself":
        "Je kunt alleen rechten toekennen die je zelf hebt.",
    },
  },
  invitePage: {
    metaTitle: "Teamuitnodiging",
    notFound: "Uitnodiging niet gevonden",
    notFoundText:
      "Controleer of je de volledige link hebt gekopieerd, of vraag een nieuwe uitnodiging.",
    used: "Uitnodiging al gebruikt",
    expired: "Uitnodiging verlopen",
    askNew: (business) =>
      `Vraag de eigenaar van ${business} om je een nieuwe uitnodiging te sturen.`,
    eyebrow: "Teamuitnodiging",
    join: (business) => `Word lid van ${business}`,
    invitedAs: "Je bent uitgenodigd als",
    using: "met",
    wrongUser: (current, invited) =>
      `Je bent ingelogd als ${current}. Log uit en log in met ${invited} om te aanvaarden.`,
    create: "Account aanmaken",
    haveAccount: "Ik heb al een account",
    accept: "Uitnodiging aanvaarden",
    failed: "We konden deze uitnodiging niet aanvaarden.",
    rpc: {
      invitation_invalid: "Deze uitnodiging is al gebruikt of werd ingetrokken.",
      invitation_expired: "Deze uitnodiging is verlopen. Vraag een nieuwe aan.",
      plan_limit_members:
        "Dit team heeft het aantal logins in zijn abonnement bereikt. Vraag de eigenaar om contact op te nemen met NORYX.",
      invitation_email_mismatch:
        "Deze uitnodiging is naar een ander e-mailadres gestuurd. Log in met dat adres om ze te aanvaarden.",
    },
  },
};
