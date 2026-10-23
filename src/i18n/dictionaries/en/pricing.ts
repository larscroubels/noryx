export const pricing = {
  metaTitle: "Pricing",
  metaDescription:
    "NORYX Basic, Pro and Ultra. Try Pro free for 14 days — no payment details needed.",
  eyebrow: "Pricing",
  title: "Three plans. Start with 14 days of Pro, free.",
  lead: "Try every Pro feature for two weeks. No payment details needed — afterwards you choose the plan that suits your salon.",
  priceSoon: "Price coming soon",
  priceNote: "Prices are announced before launch.",
  trialBadge: "14 days free",
  cta: "Start your free trial",
  plans: {
    basic: {
      name: "Basic",
      tagline: "The booking system for your salon.",
      features: [
        "Online booking page, open 24/7",
        "Calendar with day, week and month views",
        "Services, prices and team schedules",
        "Customer records for up to 250 customers",
        "Team logins with roles",
      ],
    },
    pro: {
      name: "Pro",
      tagline: "Everything to run and grow your salon.",
      everything: "Everything in Basic, plus:",
      features: [
        "Unlimited customers",
        "Payments & finance: record payments and expenses, revenue overview, CSV exports",
        "Products & stock with low-stock warnings",
        "Webshop with click & collect",
        "Time clock for your team",
        "Your own logo, cover photo and colour on your booking page",
        "Custom permissions per team member",
      ],
      soon: "Online payments and deposits",
    },
    ultra: {
      name: "Ultra",
      tagline: "Your salon on its own domain, with a website made for you.",
      everything: "Everything in Pro, plus:",
      features: [
        "Your own domain name: hairsalonsylvie.be instead of noryx.be/hairsalonsylvie",
        "A one-page website set up by the NORYX team, with all your options built in: booking, webshop and gift cards",
      ],
      setupFee: (amount: string) => `+ ${amount} one-time for your domain and website`,
      setupNote: "Start with the Pro trial; the NORYX team then sets up your domain and website.",
    },
  },
  soonBadge: "In development",
  addOns: {
    title: "Extras",
    lead: "Add these to any plan.",
    newsletter: {
      name: "Newsletter for your salon",
      text: "Send your own newsletter to clients who agreed to receive marketing messages.",
      price: (amount: string) => `+ ${amount} per month`,
    },
  },
  compare: {
    title: "Compare the plans",
    feature: "Feature",
    included: "Included",
    notIncluded: "Not included",
    rows: [
      { label: "Online booking page", basic: true, pro: true, ultra: true },
      { label: "Calendar, services and team schedules", basic: true, pro: true, ultra: true },
      { label: "Team logins with roles", basic: true, pro: true, ultra: true },
      { label: "Gift cards", basic: true, pro: true, ultra: true },
      { label: "Customers", basic: "Up to 250", pro: "Unlimited", ultra: "Unlimited" },
      { label: "Payments & finance", basic: false, pro: true, ultra: true },
      { label: "Products & stock", basic: false, pro: true, ultra: true },
      { label: "Webshop (click & collect)", basic: false, pro: true, ultra: true },
      { label: "Time clock", basic: false, pro: true, ultra: true },
      { label: "Your own booking-page branding", basic: false, pro: true, ultra: true },
      { label: "Custom permissions per team member", basic: false, pro: true, ultra: true },
      { label: "Your own domain name", basic: false, pro: false, ultra: true },
      { label: "One-page website made for you", basic: false, pro: false, ultra: true },
    ] as {
      label: string;
      basic: boolean | string;
      pro: boolean | string;
      ultra: boolean | string;
    }[],
  },
  trial: {
    title: "How the free trial works",
    steps: [
      { title: "Create your account", text: "Sign up in a few minutes. No payment details needed." },
      { title: "Use Pro for 14 days", text: "Every Pro feature is unlocked during your trial." },
      {
        title: "Choose your plan",
        text: "Pick Basic, Pro or Ultra. If you don't choose, your business continues on Basic.",
      },
    ],
  },
  billingNote:
    "Paying through NORYX isn't possible yet, so nobody is charged. Prices will be announced before anything changes.",
  questions: "More questions?",
  faqLink: "Read the frequently asked questions",
};
