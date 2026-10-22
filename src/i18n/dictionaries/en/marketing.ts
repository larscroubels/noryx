export const marketing = {
  meta: {
    title: "NORYX — The business platform for beauty professionals",
    description:
      "NORYX brings appointments, staff, customers and online booking together in one elegant platform for salons, barbers and beauty studios.",
  },
  nav: {
    features: "Features",
    booking: "Online booking",
    forYou: "Who it's for",
    pricing: "Pricing",
    faq: "FAQ",
    help: "Help",
  },
  footer: {
    tagline:
      "The business platform for salons, barbers and beauty professionals. Designed in Belgium for European businesses.",
    product: "Product",
    account: "Account",
    createAccount: "Create an account",
  },
  hero: {
    badge: "Try Pro free for 14 days",
    titleStart: "Your salon,",
    titleEmphasis: "beautifully",
    titleEnd: "organised.",
    lead: "NORYX brings online booking, your calendar, your team and your clients together in one calm, elegant workspace — made for hairdressers, barbers and beauty professionals.",
    primary: "Create your account",
    secondary: "Explore the platform",
    bullets: ["Set up in minutes", "No payment details needed", "Built for European salons"],
  },
  demo: {
    caption:
      "Animated example: the salon marks an appointment as completed while a client books a new one on their phone, which then appears in the schedule.",
    url: "noryx.app/app",
    nav: ["Overview", "Calendar", "Customers", "Services", "Staff"] as [
      string,
      string,
      string,
      string,
      string,
    ],
    weekday: "THURSDAY",
    greeting: "Good morning, Lena",
    stats: ["Today", "This week", "New clients"] as [string, string, string],
    rows: [
      { time: "09:30", name: "Sofie J.", service: "Balayage" },
      { time: "11:00", name: "Lucas D.", service: "Men's haircut" },
      { time: "13:30", name: "Emma V.", service: "Cut & blow-dry" },
      { time: "15:00", name: "Nora P.", service: "Gel manicure" },
    ],
    newRow: { time: "15:45", name: "Mila D.", service: "Gel manicure", badge: "New · online" },
    popover: {
      service: "Balayage",
      detail: "Sofie Janssens · 09:30–12:00",
      confirmed: "Confirmed",
      completed: "Completed",
      action: "Mark completed",
    },
    phone: {
      salon: "Atelier Noor",
      chooseService: "CHOOSE A SERVICE",
      services: [
        { name: "Cut & blow-dry", meta: "1 h", price: "€ 58" },
        { name: "Balayage", meta: "2 h 30 min", price: "€ 165" },
        { name: "Gel manicure", meta: "45 min", price: "€ 42" },
      ],
      pickTime: "PICK A TIME",
      days: [
        { weekday: "TUE", day: "21" },
        { weekday: "WED", day: "22" },
        { weekday: "THU", day: "23" },
        { weekday: "FRI", day: "24" },
        { weekday: "SAT", day: "25" },
      ],
      slots: ["09:30", "11:00", "14:15", "15:45", "16:30", "17:00"],
      confirm: "Confirm booking",
      successTitle: "You're booked",
      successWhen: "Wed 22 Oct · 15:45",
      successDetail: "Gel manicure · Amir",
      addToCalendar: "Add to calendar",
    },
  },
  features: {
    eyebrow: "Everything in one place",
    title: "Less admin. More time for your clients.",
    lead: "Replace the paper diary, the spreadsheets and the late-night messages with one platform your whole team enjoys using.",
    items: [
      {
        title: "Your own booking page",
        text: "A beautiful page with your services, prices, team and opening hours, where clients book 24/7 from their phone.",
      },
      {
        title: "A calendar that thinks ahead",
        text: "Day, week and month views per professional. Working hours, breaks, buffers and time off are respected automatically.",
      },
      {
        title: "Client records that matter",
        text: "Visit history, private notes and contact details in one place, with search, export and privacy tools built in.",
      },
      {
        title: "Services and prices",
        text: "Organise treatments into categories, set promotional prices and give each professional their own price or duration.",
      },
      {
        title: "Team schedules",
        text: "Part-time hours, split shifts, holidays and sick days — every change updates your online availability instantly.",
      },
      {
        title: "The right access for everyone",
        text: "Owners, managers and staff each see what they need. Your revenue stays private unless you decide otherwise.",
      },
      {
        title: "Retail & click-and-collect",
        text: "Track stock with a full movement history and let clients reserve products online to collect and pay at the salon.",
      },
      {
        title: "Payments & expenses at a glance",
        text: "Record how clients paid, log your costs and see revenue per service, professional and payment method — with CSV exports.",
      },
    ],
  },
  booking: {
    eyebrow: "Online booking",
    title: "Fully booked, without picking up the phone.",
    lead: "Clients see only the times that genuinely work — calculated from your opening hours, each professional's schedule, existing appointments and the buffers you need between them.",
    points: [
      {
        title: "No double bookings",
        text: "Every booking is re-checked on the server, and overlapping appointments are impossible at the database level.",
      },
      {
        title: "Your rules",
        text: "Minimum notice, booking horizon, cancellation window, staff choice and optional manual approval.",
      },
      {
        title: "Mobile first",
        text: "A booking flow designed for the phone in your client's hand, with an add-to-calendar button at the end.",
      },
    ],
    preview: {
      title: "Pick a date and time",
      days: [
        ["Tue", "14"],
        ["Wed", "15"],
        ["Thu", "16"],
        ["Fri", "17"],
      ] as [string, string][],
      morning: "Morning",
      confirm: "Confirm booking",
    },
  },
  team: {
    eyebrow: "Team & clients",
    title: "Built for the way salons work together.",
    items: [
      {
        title: "Every professional, their own schedule",
        text: "Split shifts, part-time weeks, holidays and one-off breaks — with personal prices and durations where needed.",
      },
      {
        title: "Private by design",
        text: "Each salon's data is isolated from every other salon. Private client notes need their own permission.",
      },
      {
        title: "A clear status for every visit",
        text: "Pending, confirmed, completed, cancelled or no-show — with a full history of every change.",
      },
      {
        title: "Data requests in one click",
        text: "Export a client's data or erase it on request, while keeping anonymised records for your bookkeeping.",
      },
    ],
  },
  forYou: {
    eyebrow: "Who it's for",
    title: "From a single chair to a busy salon team.",
    types: [
      "Hair salons",
      "Barbershops",
      "Beauty salons",
      "Nail studios",
      "Lash & brow studios",
      "Skincare & aesthetics",
      "Independent professionals",
    ],
  },
  roadmap: {
    eyebrow: "What's next",
    title: "Growing into your complete business platform.",
    lead: "These modules are in development and not available yet. The salons using NORYX today help us shape them.",
    badge: "In development",
    items: [
      {
        title: "Online payments & deposits",
        text: "Secure payments and deposits through a trusted payment provider.",
      },
      {
        title: "Email & SMS reminders",
        text: "Automatic confirmations and reminders to reduce no-shows.",
      },
      {
        title: "Client accounts",
        text: "Clients view their history and reschedule or cancel online.",
      },
      {
        title: "Multiple locations",
        text: "Separate schedules, stock and reports per salon location.",
      },
      { title: "iOS & Android apps", text: "Your salon in your pocket, for you and your team." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered.",
    metaTitle: "Frequently asked questions",
    lead: "Short answers about NORYX, our plans and how bookings work. Step-by-step guides are in the help centre.",
    helpTitle: "Looking for a step-by-step guide?",
    helpText: "The help centre has short courses with screenshots for every part of NORYX.",
    helpLink: "Open the help centre",
    items: [
      {
        q: "What does NORYX cost?",
        a: "NORYX has two plans: Basic and Pro. Prices will be announced before launch. You can try Pro free for 14 days without payment details.",
      },
      {
        q: "What's the difference between Basic and Pro?",
        a: "Basic is the booking system — online booking, calendar, services and team schedules — for up to 250 customers. Pro adds unlimited customers, payments and finance, stock, a webshop and your own branding on your booking page.",
      },
      {
        q: "What happens after the 14-day trial?",
        a: "You choose Basic or Pro. If you don't choose, your business continues on Basic. Nothing is charged automatically: paying through NORYX isn't possible yet.",
      },
      {
        q: "Can clients book without creating an account?",
        a: "Yes. Clients choose a service, professional and time, and leave their name, email and phone number. No password needed.",
      },
      {
        q: "Can two clients book the same time?",
        a: "No. Availability is checked again on the server at the moment of booking, and the database itself refuses overlapping appointments for the same professional.",
      },
      {
        q: "Do my employees see my revenue?",
        a: "Not by default. Staff members see their own appointments and clients. You decide who can see business figures or manage settings.",
      },
      {
        q: "Where is my data stored?",
        a: "NORYX is built for European businesses. Every salon's data is strictly separated from other salons, and you can export or erase a client's personal data on request.",
      },
      {
        q: "Does NORYX send confirmation emails?",
        a: "Not yet. Bookings and orders are confirmed on screen and clients can add appointments to their calendar. Email and SMS notifications are in development.",
      },
      {
        q: "Can clients pay online?",
        a: "Not yet. You record payments taken at the salon, and shop orders are paid at pickup. Online payments will use a trusted payment provider once available.",
      },
      {
        q: "Is NORYX available in Dutch and French?",
        a: "Yes. NORYX is available in Dutch, French and English — switch at the top of any page.",
      },
    ],
  },
  finalCta: {
    title: "Ready when your clients are.",
    lead: "Create your account, add your services and share your booking page today.",
    primary: "Get started",
    secondary: "Sign in",
  },
};
