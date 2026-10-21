import type { HelpContent } from "./types";

export const en: HelpContent = {
  courses: [
    {
      slug: "aan-de-slag",
      icon: "rocket",
      audience: "owner",
      minutes: 6,
      title: "Getting started with NORYX",
      summary:
        "Create your account, set up your business and publish your booking page — in about ten minutes.",
      steps: [
        {
          title: "Create your account",
          body: [
            "Go to the home page and choose **Get started**. Enter your name, your email address and a password (at least 10 characters, with a letter and a number) and accept the terms.",
            "You'll receive an email to confirm your address. Click the button in that email and you land straight in the setup.",
          ],
          image: { name: "signup", alt: "The NORYX sign-up form" },
          tip: "Use **NL | EN** at the top of any page to choose the language you use NORYX in. Your choice is remembered.",
        },
        {
          title: "Tell us about your business",
          body: [
            "Enter your business name and type of business. NORYX suggests an address for your booking page straight away, such as **noryx.app/atelier-noor**. You can change it as long as it's still free.",
            "Click **Create my business**. Everything you enter during setup can be changed later in **Settings**.",
          ],
          image: { name: "onboarding-business", alt: "Setup step 1: business details" },
        },
        {
          title: "Add your address and opening hours",
          body: [
            "In the next steps you add your address and contact details and set your opening hours per day. Tick a day to open it and choose the start and end time.",
            "Clients can only book within your opening hours, and only when the chosen professional is working too.",
          ],
          image: { name: "onboarding-hours", alt: "Setting opening hours during setup" },
        },
        {
          title: "Add services and yourself",
          body: [
            "Add your first services with their duration and price. You can always add more later under **Services**.",
            "Do you take appointments yourself? Choose **Yes, clients can book appointments with me** and NORYX creates your professional profile with your opening hours and every service.",
          ],
        },
        {
          title: "Publish your booking page",
          body: [
            "In the last step you choose whether your booking page goes live right away. Click **Go to my dashboard** to finish.",
            "The **Overview** then shows today's appointments, your key figures and a short list of what's left to set up.",
          ],
          image: { name: "overview", alt: "The workspace overview with key figures and today's schedule" },
          tip: "Share your booking page link on Instagram, Google or your website. You can always find it via **View booking page** at the top right.",
        },
      ],
      faq: [
        {
          q: "I didn't receive a confirmation email. What now?",
          a: "Check your spam folder. If it isn't there, sign up again with the same address or use **Forgot password?** on the sign-in page.",
        },
        {
          q: "Can I manage more than one business?",
          a: "Yes. Open the menu with your name at the bottom left and choose **Add another business**. Use **Switch business** to move between them.",
        },
        {
          q: "Can I still change my booking page address?",
          a: "You choose the address when you create your business. To change it later, contact NORYX so existing links don't silently stop working.",
        },
      ],
    },
    {
      slug: "agenda-en-afspraken",
      icon: "calendar",
      audience: "everyone",
      minutes: 7,
      title: "Calendar and appointments",
      summary:
        "Work with the day, week and month views, book appointments, move them and keep their status up to date.",
      steps: [
        {
          title: "Choose your view",
          body: [
            "Open **Calendar** in the menu. In the **Day** view every professional gets their own column. **Week** and **Month** give you an overview of a longer period.",
            "Use the arrows and **Today** to move through time, and **All professionals** to show one person's calendar.",
          ],
          image: { name: "calendar-week", alt: "The calendar week view with appointments per day" },
          tip: "A striped block means time off, such as a holiday or sick leave. Nobody can book online during that period.",
        },
        {
          title: "Book an appointment",
          body: [
            "Click **New appointment**. Choose an **Existing client** or create a **New client** on the spot, then pick the service, professional, date and start time.",
            "Duration and price come from the service (or from the professional's own price). If the appointment overlaps another one, you get a message and it isn't saved.",
          ],
          image: { name: "new-appointment", alt: "The form to book a new appointment" },
        },
        {
          title: "Update the status",
          body: [
            "Click an appointment to open its details. At the top you'll find the actions available at that moment: **Confirm**, **Mark completed**, **Mark no-show** or **Cancel**.",
            "Every change is added to the appointment's **History**, with date and time.",
          ],
          image: { name: "appointment-detail", alt: "An appointment's detail page with status, rescheduling and payment" },
        },
        {
          title: "Move or cancel",
          body: [
            "Under **Reschedule**, choose a new date, start time or another professional and click **Move appointment**.",
            "When you **Cancel**, you can add a reason. The time becomes available again for online booking straight away.",
          ],
        },
        {
          title: "Approve online requests",
          body: [
            "If you switched on **Approve online bookings manually** in **Settings**, new bookings arrive as pending. The time is held for the client meanwhile.",
            "The **Overview** then shows a notice. Click **Review requests** and confirm or cancel each request.",
          ],
          image: { name: "requests", alt: "The list of booking requests waiting for confirmation" },
        },
      ],
      faq: [
        {
          q: "Can a professional be double-booked?",
          a: "No. NORYX checks this in the database itself: a professional can never have two overlapping appointments, even if two people book at exactly the same moment.",
        },
        {
          q: "What does a staff member see in the calendar?",
          a: "With the default **Staff member** role you only see your own appointments and the clients booked with you. The owner can change this per person under **Team**.",
        },
        {
          q: "I clicked ‘completed’ by mistake.",
          a: "Open the appointment again and click **Confirm**. That puts a completed or no-show appointment back.",
        },
      ],
    },
    {
      slug: "online-boeken",
      icon: "globe",
      audience: "owner",
      minutes: 6,
      title: "Online booking for your clients",
      summary:
        "How your booking page works, which rules you set and how clients can cancel themselves.",
      steps: [
        {
          title: "Your public page",
          body: [
            "Your booking page shows your services with price and duration, your team, your opening hours and your contact details. Clients don't need an account.",
            "Set your logo, cover photo and description under **Settings** › **Business profile** and **Branding**.",
          ],
          image: { name: "public-page", alt: "The public booking page of the demo salon" },
        },
        {
          title: "How a client books",
          body: [
            "The client chooses a service, optionally a professional, and then a day and a free time. NORYX only shows times that really work: within your opening hours and the professional's schedule, without overlap and with the buffers you set.",
            "Finally the client enters their name, email and phone number and accepts the booking terms.",
          ],
          image: { name: "booking-time", alt: "A client choosing a time on their phone", mobile: true },
        },
        {
          title: "Set your booking rules",
          body: [
            "Go to **Settings** › **Online booking**. Choose the **Minimum notice** (how far ahead someone must book), the **Booking horizon**, how often a start time is offered and how much buffer sits between appointments.",
            "You also choose whether clients may pick their professional and whether you want to approve online bookings first.",
          ],
          image: { name: "settings-booking", alt: "The online booking settings" },
        },
        {
          title: "Cancellation by the client",
          body: [
            "After booking, the client gets a private link to view or cancel the booking. That works until the number of hours you set under **Free cancellation until**. After that, the page points to your phone number.",
            "As long as no email provider is connected, NORYX doesn't send confirmation emails. The client then sees the link on the confirmation screen and can add the appointment to their own calendar.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I switch online booking off temporarily?",
          a: "Yes. Under **Settings** › **Online booking**, turn off **Online booking page is live**. Your page is then hidden and nobody can book online.",
        },
        {
          q: "Do clients pay online?",
          a: "Not yet. Online payments and deposits need a connected payment provider. Until then clients pay at the salon and you record the payment on the appointment.",
        },
        {
          q: "Why does a client see no times on a certain day?",
          a: "The business or professional is closed that day, everything is booked, the day is beyond the booking horizon, or it's too soon according to your minimum notice.",
        },
      ],
    },
    {
      slug: "klanten",
      icon: "users",
      audience: "everyone",
      minutes: 5,
      title: "Customers and privacy",
      summary: "Find customers, see their history, keep notes and handle privacy requests.",
      steps: [
        {
          title: "Your customer list",
          body: [
            "Open **Customers**. Clients who book online are added automatically. Use **Add customer** to create someone yourself.",
            "Search by name, email or phone number and sort by **Newest first** or **Name A–Z**.",
          ],
          image: { name: "customers", alt: "The customer list with search" },
        },
        {
          title: "The customer profile",
          body: [
            "Click a customer to see upcoming appointments, history, completed visits and their value. Use **Book appointment** to schedule a new one right away.",
            "Under **Private notes** you can record a colour formula or preferences, for example. Notes are only visible to team members with access to customer notes.",
          ],
          image: { name: "customer-detail", alt: "A customer profile with appointments and notes" },
          tip: "Don't record health details unless the client explicitly agreed.",
        },
        {
          title: "Marketing consent",
          body: [
            "Only tick **Agreed to receive marketing messages** if the client really asked for it. When booking online, clients choose this themselves.",
          ],
        },
        {
          title: "Access and erasure requests (GDPR)",
          body: [
            "Does a client ask which data you keep? Click **Export personal data** for a file with all of that client's data.",
            "If a client wants to be erased, choose **Erase personal data**. Name, email, phone and notes are permanently removed. Appointments stay, anonymised, for your bookkeeping.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I export all my customers?",
          a: "Yes, with **Export CSV** at the top of the customer list. You need the ‘Create, edit, export and delete customer records’ permission.",
        },
        {
          q: "A client booked online with a different email address. Is that a new customer?",
          a: "Yes, NORYX recognises customers by email address. Update the address on the profile if it's the same person.",
        },
      ],
    },
    {
      slug: "behandelingen-en-team",
      icon: "scissors",
      audience: "owner",
      minutes: 8,
      title: "Services, staff and team",
      summary:
        "Manage your services and prices, schedules and time off, and who can see what in your workspace.",
      steps: [
        {
          title: "Services and prices",
          body: [
            "Open **Services** and click **New service**. Enter a name, category, duration and price. A **Promotional price** must be lower than the regular price; clients then see both.",
            "**Buffer after** reserves time to clean up. Turn off **Bookable online** if a service may only be booked through the salon.",
          ],
          image: { name: "services", alt: "The list of services by category" },
        },
        {
          title: "Who performs what?",
          body: [
            "At the bottom of the form, tick the professionals who perform the service. Only they can be booked for it.",
            "Does someone have their own price or duration? Set it on the professional's profile under **Services**.",
          ],
          image: { name: "service-form", alt: "Editing a service with its assigned professionals" },
        },
        {
          title: "Working hours and time off",
          body: [
            "Open **Staff** and choose a person. Under **Working hours** you set the hours per day; add a break to split a day in two.",
            "Under **Time off** you plan a holiday, sick leave or training. Nobody can book that person online during that period.",
          ],
          image: { name: "staff-detail", alt: "A professional's profile with working hours" },
        },
        {
          title: "Invite team members",
          body: [
            "Open **Team** and enter the email address and role under **Invite someone**. Link the invitation to a staff profile so that person sees their own calendar.",
            "NORYX creates an invitation link that's valid for 7 days. While email isn't set up, you share that link yourself, for example via WhatsApp.",
          ],
          image: { name: "team", alt: "The team page with members and invitations" },
        },
        {
          title: "Roles and permissions",
          body: [
            "There are three roles: **Owner** (everything), **Manager** (day-to-day operations, without revenue, settings and team) and **Staff member** (own calendar and clients).",
            "Use **Access** to grant or remove individual permissions per person. Revenue and settings stay private unless you explicitly share them.",
          ],
        },
      ],
      faq: [
        {
          q: "What happens when I delete a service?",
          a: "It disappears from your booking page. Past and upcoming appointments keep their details. To hide it temporarily, mark it inactive instead.",
        },
        {
          q: "Someone left. Should I delete their profile?",
          a: "No, mark the profile inactive. Their appointment history is kept. Under **Team**, use the remove icon to revoke their access to the workspace.",
        },
        {
          q: "How many professionals can I add?",
          a: "That depends on your plan. You'll find the limits under **Settings** › **Plan**.",
        },
      ],
    },
    {
      slug: "webshop-en-voorraad",
      icon: "shopping",
      audience: "owner",
      minutes: 6,
      title: "Webshop and stock",
      summary:
        "Manage your products and stock, switch on click-and-collect and process orders until they're picked up.",
      steps: [
        {
          title: "Products and stock",
          body: [
            "Open **Products** and click **New product**. Enter the selling price, the purchase cost (for your margin) and the level at which you want a low-stock warning.",
            "Products running low get a label and appear on the **Overview**.",
          ],
          image: { name: "products", alt: "The product list with stock levels and low-stock labels" },
        },
        {
          title: "Update stock",
          body: [
            "Open a product and choose a reason under **Update stock**: a delivery, a return, a sale in the salon, damaged goods or a stock count correction.",
            "Every change goes into the **Stock history**, so you always see where a difference comes from.",
          ],
          image: { name: "product-detail", alt: "A product with its stock history" },
        },
        {
          title: "Switch on your webshop",
          body: [
            "Tick **Sell in the online shop** on a product. Then turn on **Online shop is live** under **Settings** › **Webshop**.",
            "Clients reserve online and pay when they pick up at the salon. Online payment isn't available yet.",
          ],
        },
        {
          title: "Process orders",
          body: [
            "New orders appear under **Orders**. Their products are already reserved in your stock at that moment.",
            "Open an order and work through it step by step: **Accept order**, **Mark ready for pickup** and **Mark picked up**. Record the payment with **Mark as paid**. If you cancel an order, its products go back into stock.",
          ],
          image: { name: "order-detail", alt: "A webshop order with its next step" },
        },
      ],
      faq: [
        {
          q: "What if a product is sold out?",
          a: "Clients can't order more than you have in stock. In the webshop the product shows as **Out of stock**.",
        },
        {
          q: "Does the client get a confirmation?",
          a: "The client sees the order number on screen. Email confirmations are only sent once an email provider is connected.",
        },
      ],
    },
    {
      slug: "financien",
      icon: "wallet",
      audience: "owner",
      minutes: 5,
      title: "Payments and finance",
      summary: "Record payments and expenses, follow your revenue and export everything for your accountant.",
      steps: [
        {
          title: "Record a payment",
          body: [
            "Open an appointment and enter the amount and method under **Payment**, such as Bancontact, card or cash. Click **Record payment**.",
            "NORYX doesn't process payments itself: you record what the client paid at the salon. Once everything is paid, it says **Paid in full**.",
          ],
          image: { name: "appointment-payment", alt: "Recording a payment on an appointment" },
        },
        {
          title: "Your finance overview",
          body: [
            "Open **Finance** and choose a period. You see your **Recorded revenue**, your **Expenses** and the **Result**, plus revenue per service, professional and payment method.",
            "**Booked value** is an estimate based on booked appointments and is shown separately, so you never confuse it with real payments.",
          ],
          image: { name: "finance", alt: "The finance overview with totals and breakdowns" },
        },
        {
          title: "Expenses and refunds",
          body: [
            "Add expenses with a description, amount, date, category and optionally a supplier and invoice number.",
            "Gave money back to a client? Mark the payment as refunded. It stays visible but no longer counts towards revenue.",
          ],
        },
        {
          title: "Export for your accountant",
          body: [
            "Use **Payments CSV** and **Expenses CSV** to download everything for the chosen period. Open the files in Excel or hand them to your accountant.",
          ],
          tip: "NORYX isn't accounting software. Use your accountant's tools for bookkeeping and VAT returns.",
        },
      ],
      faq: [
        {
          q: "Who can see revenue?",
          a: "Only the owner and team members you give the ‘View revenue, expenses and financial summaries’ permission. Managers and staff don't see revenue by default.",
        },
        {
          q: "Do amounts include VAT?",
          a: "Amounts are what you enter. Record them as the client paid them, which usually means including VAT.",
        },
      ],
    },
    {
      slug: "instellingen",
      icon: "settings",
      audience: "owner",
      minutes: 4,
      title: "Settings and account",
      summary: "Adjust your profile, branding, opening hours and plan, and manage your personal account.",
      steps: [
        {
          title: "Profile and branding",
          body: [
            "Under **Settings** › **Business profile** you add your description, public contact details, website, Instagram and an accent colour for your booking page.",
            "Under **Branding** you upload your logo and a cover photo: PNG, JPG or WebP, up to 2 MB.",
          ],
          image: { name: "settings", alt: "Settings showing the business profile" },
        },
        {
          title: "Opening hours and location",
          body: [
            "Under **Opening hours** you can add a break per day. Changes update your online availability immediately.",
            "**Location** holds your address and phone number as clients see them.",
          ],
        },
        {
          title: "Your plan",
          body: [
            "Under **Plan** you see which features are included and how many professionals and logins you can use. During early access you aren't charged.",
          ],
        },
        {
          title: "Your personal account",
          body: [
            "Click your name at the bottom left and choose **Account settings** to change your name, email address or password. These are separate from your business.",
          ],
          image: { name: "account", alt: "Account settings with name, email and password" },
        },
      ],
      faq: [
        {
          q: "Why can't I open the settings?",
          a: "Only the owner and team members with permission to manage settings see this menu. Ask the owner to adjust your access under **Team**.",
        },
        {
          q: "How do I change the language?",
          a: "Click **NL** or **EN** at the top. Your choice is remembered for a year on that device.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is my data, and my clients' data, safe?",
      a: "Every business is strictly separated: the database checks on every request whether you have access, even if someone changes a link or ID. Your team only sees what you allow.",
    },
    {
      q: "Does NORYX email my clients?",
      a: "Only once an email provider is connected. Until then NORYX sends nothing and says so honestly on screen, so nobody waits for an email that won't arrive.",
    },
    {
      q: "Can NORYX process payments?",
      a: "Not yet. You record payments made at the salon. Online payment comes once a payment provider is connected.",
    },
    {
      q: "Does NORYX work on my phone?",
      a: "Yes. The workspace and booking page are built for both phone and computer. There's nothing to install.",
    },
  ],
};
