/** Copy for the public website's pages: the short home page, booking platform, apps and support. */
export const site = {
  home: {
    benefitsTitle: "Why salons choose NORYX",
    benefits: [
      {
        title: "Booked around the clock",
        text: "Clients book online 24/7 and only see times that really work for you and your team.",
      },
      {
        title: "One calm workspace",
        text: "Calendar, clients, services and team schedules together, on your computer, tablet or phone.",
      },
      {
        title: "Private and secure",
        text: "Every salon's data is kept apart, and everyone in your team sees only what they need.",
      },
      {
        title: "Start for free",
        text: "Try every Pro feature for 14 days. No payment details needed.",
      },
    ],
    exploreEyebrow: "Discover NORYX",
    exploreTitle: "Find out what NORYX can do for you.",
    explore: {
      forYou: "Hair salons, barbers, nail and beauty studios, solo or with a team.",
      platform: "How online booking, your calendar and your team's availability work together.",
      apps: "What your clients see when they book, and how you run your business.",
      pricing: "Basic and Pro side by side, the extra options and the free 14-day trial.",
      faq: "Short answers about plans, bookings, privacy and the trial.",
      help: "Step-by-step courses, answers and a way to reach the NORYX team.",
    },
    readMore: "Read more",
  },
  platform: {
    metaTitle: "Booking platform",
    metaDescription:
      "How the NORYX booking platform works: your own booking page, a calendar that respects everyone's schedule, and no double bookings.",
    eyebrow: "Booking platform",
    title: "Your appointments and availability, under control.",
    lead: "Set up your services and opening hours once. NORYX works out when each professional is free, and clients book online around the clock.",
    howTitle: "How it works",
    steps: [
      {
        title: "Add your services",
        text: "Treatments with their own duration, price and buffer time, in categories you choose.",
      },
      {
        title: "Plan your team",
        text: "Opening hours, working hours, breaks and time off per professional.",
      },
      {
        title: "Share your booking page",
        text: "Your page with services, prices and team, on its own address. Put it in your bio, website or messages.",
      },
      {
        title: "Clients book, you're in control",
        text: "New bookings appear in your calendar straight away. You can approve requests first if you prefer.",
      },
    ],
    featuresTitle: "Everything in one platform",
    manageTitle: "Managing availability",
    manageLead:
      "Your online availability follows your schedules automatically. Change a working day or add time off, and the booking page updates instantly.",
    soonTitle: "Coming next",
    ctaTitle: "See it working in your own salon.",
    ctaText: "Create your account, add your services and share your booking page today.",
  },
  apps: {
    metaTitle: "App for clients and you",
    metaDescription:
      "What NORYX looks like for your clients when they book, and for you when you run your business.",
    eyebrow: "For your clients and for you",
    title: "One platform, two sides.",
    lead: "Your clients book in a few taps on their phone. You run your appointments, team and business in your own workspace. Here's what each side gets.",
    clients: {
      eyebrow: "For your clients",
      title: "Booking without the back-and-forth",
      lead: "Clients use your booking page in their browser. They don't need to install anything or create an account.",
      points: [
        "Choose a service, a professional (or anyone) and a free time",
        "Book 24/7 on their phone, with an add-to-calendar button",
        "A private link to view their booking or cancel it within your deadline",
        "Reserve products to collect and pay at the salon (Pro)",
        "Order a gift card and check its balance with the code",
      ],
    },
    business: {
      eyebrow: "For you and your team",
      title: "Your business in one workspace",
      lead: "The NORYX workspace runs in the browser on your computer, tablet and phone. Each team member signs in with their own account.",
      points: [
        "Today's overview, booking requests and setup checklist",
        "Calendar per professional, by day, week or month",
        "Client records with visit history and private notes",
        "Services, prices, team schedules and time off",
        "Time clock, payments, stock and webshop (Pro)",
        "Roles and permissions, so everyone sees what they need",
      ],
    },
    webNote:
      "Today NORYX works in the browser on every device. Native apps for iOS and Android are in development.",
    ctaTitle: "Try both sides yourself.",
    ctaText: "Create your salon, then book an appointment on your own booking page.",
  },
  support: {
    title: "Support and contact",
    lead: "Find the answer yourself in a few minutes, or ask the NORYX team.",
    courses: { title: "Courses", text: "Step-by-step guides with screenshots for every part of NORYX." },
    faq: { title: "Frequently asked questions", text: "Short answers about plans, bookings, privacy and the trial." },
    assistant: {
      title: "Ask the assistant",
      text: "Get an answer straight away, based on the information on this website.",
      action: "Open the assistant",
    },
    workspace: {
      title: "Already using NORYX?",
      text: "The same courses are under Help in your workspace.",
      action: "Go to your workspace",
    },
    contact: {
      title: "Contact the NORYX team",
      lead: "Can't find your answer? Send us your question and we'll reply by email.",
      name: "Your name",
      email: "Email address",
      topic: "Topic",
      topics: {
        question: "A question about NORYX",
        account: "My account or signing in",
        billing: "Plans and pricing",
        problem: "Something doesn't work",
        other: "Something else",
      },
      message: "Your message",
      messageHint: "If you saw an error, add the reference number from the error page.",
      privacy:
        "We only use your name and email address to answer your question. Delete requests can be sent through this form too.",
      submit: "Send message",
      sent: (email: string) =>
        `Thank you. Your message has reached the NORYX team; we'll reply to ${email}.`,
      rateLimited: "You've sent several messages in a short time. Please wait a while and try again.",
    },
  },
  faqGroups: { product: "NORYX and our plans", usage: "Using NORYX" },
  cta: { start: "Start your free trial", pricing: "Compare plans", signIn: "Sign in" },
};
