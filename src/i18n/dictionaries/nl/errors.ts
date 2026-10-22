import type { errors as en } from "../en/errors";

export const errors: typeof en = {
  generic: "Er ging iets mis. Probeer het opnieuw.",
  noPermission: "Je hebt geen toestemming om dit te doen.",
  alreadyExists: "Dit bestaat al. Kies een andere waarde.",
  overlap: "Dat tijdstip overlapt met een andere afspraak of met andere openingsuren.",
  inUse: "Dit wordt nog gebruikt en kan zo niet gewijzigd worden.",
  notAllowedValues: "Sommige waarden zijn niet toegestaan.",
  tooManyAttempts: "Te veel pogingen. Wacht enkele minuten en probeer het opnieuw.",
  noAccessBusiness: "Je hebt geen toegang tot deze zaak.",
  planLimitStaff:
    "Het maximumaantal medewerkers van je abonnement is bereikt. Zet iemand op inactief of neem contact op met NORYX om je abonnement te wijzigen.",
  planLimitMembers:
    "Het maximumaantal teamlogins van je abonnement is bereikt. Verwijder een lid of neem contact op met NORYX om je abonnement te wijzigen.",
  planFeatureShop: "De webshop zit niet in je huidige abonnement.",
  planLimitCustomers: "Basic bevat tot 250 klanten. Stap over naar Pro om er meer toe te voegen.",
  planFeatureFinance: "Betalingen en financiën zitten in Pro.",
  planFeatureInventory: "Producten en voorraad zitten in Pro.",
  planFeatureBranding: "Een eigen logo, omslagfoto en kleur zitten in Pro.",
  planFeatureTeamPermissions: "Eigen rechten per teamlid zitten in Pro.",
};
