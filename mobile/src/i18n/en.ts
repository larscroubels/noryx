/** Strings only the app needs. Everything the website already says comes from its dictionaries. */
export const en = {
  common: {
    retry: "Try again",
    close: "Close",
    loading: "Loading…",
    loadFailed: "We couldn't load this. Check your connection and try again.",
    signOut: "Sign out",
  },
  tabs: {
    today: "Today",
    calendar: "Calendar",
    clients: "Clients",
    clock: "Clock",
    more: "More",
  },
  language: {
    title: "Language",
    salon: "Salon language",
  },
  auth: {
    signUpLead:
      "One account for booking at your salons, and for your work if you're on a salon's team.",
    sessionEnded: "You've been signed out. Please sign in again.",
    notConfigured: "This build of the app isn't connected to NORYX yet.",
    termsLabel: "I agree to the terms and conditions and the privacy policy",
    readTerms: "Read the terms",
    readPrivacy: "Read the privacy policy",
  },
  side: {
    pickTitle: "Where do you want to start?",
    pickLead:
      "You work at a salon and you're also a client. You can switch any time in your profile.",
    salon: "My salon work",
    client: "My appointments as a client",
    switchToSalon: "Switch to my salon work",
    switchToClient: "Switch to my client side",
  },
  clientSoon: {
    title: "Booking in the app is almost here",
    text: "Soon you'll link your salons here with their code and book in a few taps. Until then, book on your salon's booking page.",
    runSalon: "Run a salon? Set it up on noryx",
  },
  profile: {
    title: "Profile",
    open: "Open your profile",
    deviceLanguage: "Phone language",
    business: "Business",
    deleted: "Your account has been deleted.",
  },
  more: {
    lead: "These parts of your workspace open on the NORYX website, already signed in.",
    failed: "We couldn't open this page signed in. Check your connection and try again.",
  },
  client: {
    onboarding: {
      welcomeTitle: "Welcome to NORYX",
      welcomeText: "Link the salons you visit and book with them in a few taps.",
      start: "Get started",
      servicesTitle: "Which services do you use?",
      servicesText: "Choose one or more. You can change this later.",
      next: "Next",
      codesTitle: "Enter your salons' codes",
      codesText:
        "Ask each salon for its NORYX code. One salon can serve several services: use the same code.",
      codeLabel: (category: string) => `Code for ${category}`,
      link: "Link salons",
      linked: (name: string) => `Linked: ${name}`,
      resend: "Resend confirmation email",
      resent: "We sent the confirmation email again. Open it, then link your salons here.",
      resendFailed: "We couldn't send the email. Please try again in a minute.",
      done: "Start booking",
    },
    linkErrors: {
      too_many_attempts: "Too many codes tried. Please wait 15 minutes and try again.",
      connection_code_invalid: "We don't recognise this code. Check it with your salon.",
      categories_required: "Choose at least one service for this salon.",
      customer_already_linked:
        "This salon's client record is already linked to another account. Please contact the salon.",
      client_link_required: "Link this salon again with its code before booking.",
    },
  },
};
