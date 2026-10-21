export const onboarding = {
  metaTitle: "Set up your business",
  stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
  progress: "Setup progress",
  welcome: "Welcome to NORYX",
  steps: [
    {
      title: "Tell us about your business",
      description: "This takes about three minutes. Everything can be changed later.",
    },
    {
      title: "Where can clients find you?",
      description: "Your address and contact details appear on your booking page.",
    },
    { title: "When are you open?", description: "Clients can only book within your opening hours." },
    {
      title: "Add your first services",
      description: "Start with a few popular treatments — you can add the rest later.",
    },
    {
      title: "Who takes appointments?",
      description: "Add yourself as a professional, or skip if you only manage the salon.",
    },
    {
      title: "Ready to welcome clients",
      description: "Publish your booking page now, or keep it private while you finish setting up.",
    },
  ],
  saveContinue: "Save and continue",
  skip: "Skip for now",
  business: {
    name: "Business name",
    type: "Type of business",
    chooseOne: "Choose one",
    address: "Booking page address",
    addressHint: "Clients use this link to book online. You can publish the page at the end.",
    submit: "Create my business",
    slugTaken: "This address is already taken.",
    chooseAnother: "Please choose another booking address.",
    maxBusinesses: "You've reached the maximum number of businesses for one account.",
  },
  location: {
    name: "Location name",
    nameHint: "Shown to clients, e.g. your salon's name or neighbourhood.",
    email: "Contact email",
    emailHint: "Receives new booking notices.",
  },
  hours: { check: "Please check the opening hours." },
  services: {
    already: "You already added services. Add more here or continue.",
    name: "Service name",
    placeholder: "e.g. Gel manicure",
    examples: ["Women's cut & blow-dry", "Men's haircut"],
    check: "Please check the highlighted services.",
  },
  team: {
    question: "Do you take appointments yourself?",
    yes: "Yes, clients can book appointments with me",
    yesHint:
      "We'll create your professional profile using the opening hours and services you just added.",
    no: "No, I only manage the business",
    noHint: "You can add your team from the Staff page.",
    displayName: "Name shown to clients",
    jobTitlePlaceholder: "e.g. Senior stylist",
    checkDetails: "Please check your details.",
  },
  publish: {
    label: "Publish my online booking page",
    before: "Clients can book at",
    after: ". You can turn this off at any time in Settings.",
    submit: "Go to my dashboard",
  },
};
