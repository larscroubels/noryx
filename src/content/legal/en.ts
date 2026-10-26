import type { CompanyText } from "@/lib/legal";

import type { LegalContent } from "./types";

/** English translation of the Dutch legal texts. */
export function en(c: CompanyText): LegalContent {
  const contact = c.email
    ? `[${c.email}](mailto:${c.email}) or the [contact form](/help#contact)`
    : "the [contact form](/help#contact)";
  return {
    updated: (date) => `Last updated on ${date}`,
    contents: "Contents",
    translationNote: "This is a translation. If the versions differ, the Dutch text prevails.",
    privacy: {
      metaTitle: "Privacy policy",
      title: "Privacy policy",
      lead: "How NORYX handles personal data: of visitors to this website, of salons and their team, and of the clients who book with a salon.",
      sections: [
        {
          id: "who",
          title: "Who is responsible?",
          paragraphs: [
            `NORYX is run by **${c.name}** (${c.legalForm}), ${c.address}, enterprise number ${c.enterpriseNumber}. In this policy we call that ‘NORYX’, ‘we’ or ‘us’.`,
            `Ask your privacy questions through ${contact}.`,
          ],
        },
        {
          id: "roles",
          title: "Two roles",
          paragraphs: [
            "For data about visitors to this website and about the accounts of salons and their team members, we are the **controller**.",
            "For data about a salon's clients (bookings, contact details, notes), the **salon** is the controller. NORYX only processes that data on the salon's behalf, as a **processor**, under the data processing agreement in our [terms and conditions](/terms#processing).",
          ],
        },
        {
          id: "data",
          title: "What data, why, and on what basis",
          paragraphs: [],
          list: [
            "**Your account**: name, email address and password (never stored in readable form). Needed to give you access to NORYX; basis: performance of the contract.",
            "**Your salon**: business details, location, opening hours, services, prices, schedules, hours worked and team members. Needed to provide the service; basis: performance of the contract.",
            "**The contact form**: name, email address, topic and your message. To answer your question; basis: our legitimate interest in handling questions, or steps before a contract.",
            "**The AI assistant on the website**: the questions you type. We send them to Anthropic to produce an answer; we don't store your conversation ourselves. Don't share personal data in it. Basis: our legitimate interest in helping visitors quickly.",
            "**Technical data**, such as your IP address and the time of a request. To keep the website secure and limit abuse, for example with a limit on sign-in attempts; basis: our legitimate interest.",
            "**Cookies**: only what's needed to sign in and remember your language. See the [cookie policy](/cookies).",
          ],
        },
        {
          id: "salon-clients",
          title: "When you book with a salon",
          paragraphs: [
            "When you book an appointment, order from the webshop or buy a gift card from a salon that uses NORYX, your name, email address, phone number and the details of your appointment or order go to **that salon**. The salon decides what happens with them and is your first point of contact.",
            "With the private link from your booking you can view your appointment and cancel it within the salon's deadline. To see or erase your data, ask the salon: it can export or delete it in NORYX. If that doesn't work, contact us and we'll help the salon.",
            "If you create a client account in the NORYX app, we store your name, email address and the salons you link to. Deleting your account removes it; salons keep their own client records.",
            "You only receive offers from a salon if you tick that box yourself when booking.",
          ],
        },
        {
          id: "processors",
          title: "Who processes data for us?",
          paragraphs: [
            "We don't sell personal data or use it for advertising. These service providers process data only on our instructions:",
          ],
          list: [
            `**Supabase**: database, sign-in and file storage. Data region: ${c.dataRegion}.`,
            "**Vercel**: hosting of the website.",
            "**Anthropic**: the AI assistant on the website, only for the questions you type into it.",
          ],
        },
        {
          id: "transfers",
          title: "Data outside Europe",
          paragraphs: [
            "Supabase, Vercel and Anthropic are companies based in the United States. When data is processed outside the European Economic Area, this only happens with the safeguards the GDPR requires, such as the EU-US Data Privacy Framework or the European Commission's standard contractual clauses.",
          ],
        },
        {
          id: "retention",
          title: "How long do we keep data?",
          paragraphs: [],
          list: [
            "**Account data**: as long as your account exists. If you ask for deletion, we erase it, except what we're legally required to keep.",
            "**Data of a salon and its clients**: as long as the salon uses NORYX. The salon can export or erase client data itself; financial records then stay anonymised for the salon's bookkeeping.",
            "**Messages through the contact form**: as long as needed to handle your question. You can always ask us to delete your message.",
            "**Questions to the AI assistant**: we don't keep them. Anthropic processes them to produce the answer.",
            "**Technical logs**: briefly, under our hosting partners' retention periods.",
          ],
        },
        {
          id: "security",
          title: "Security",
          paragraphs: [
            "Connections are encrypted (HTTPS). Passwords are never stored in readable form. Each salon's data is strictly separated from other salons' in the database, and team members only see what their role allows. Important changes are recorded in an audit log.",
          ],
        },
        {
          id: "rights",
          title: "Your rights",
          paragraphs: [
            `You have the right to access your data, have it corrected or erased, restrict its processing, object, and take your data with you. Send your request through ${contact}. We reply within one month and may ask you to confirm your identity.`,
            "Is it about your data as a salon's client? Then first send your request to that salon (see [When you book with a salon](#salon-clients)).",
          ],
        },
        {
          id: "complaint",
          title: "Making a complaint",
          paragraphs: [
            "If you disagree with how we handle your data, please tell us first. You can also complain to the Belgian Data Protection Authority (Gegevensbeschermingsautoriteit), Drukpersstraat 35, 1000 Brussels, [contact@apd-gba.be](mailto:contact@apd-gba.be), [www.gegevensbeschermingsautoriteit.be](https://www.gegevensbeschermingsautoriteit.be/burger/acties/klacht-indienen).",
          ],
        },
        {
          id: "changes",
          title: "Changes",
          paragraphs: [
            "NORYX accounts are meant for business owners and their staff, not for children. When we change this policy, the date at the top changes; we announce important changes in NORYX.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Cookie policy",
      title: "Cookie policy",
      lead: "NORYX only uses cookies that are needed for the website and your workspace to work. No cookies for statistics, advertising or social media.",
      sections: [
        {
          id: "what",
          title: "What are cookies?",
          paragraphs: [
            "Cookies are small text files a website stores in your browser, for example to remember that you're signed in.",
          ],
        },
        {
          id: "list",
          title: "Which cookies do we use?",
          paragraphs: [],
          table: {
            headers: ["Cookie", "Purpose", "Duration", "Type"],
            rows: [
              [
                "sb-…-auth-token",
                "Keeps you signed in (Supabase). May be stored in parts (.0, .1).",
                "Until you sign out, at most 400 days",
                "Strictly necessary",
              ],
              [
                "sb-…-auth-token-code-verifier",
                "Secures confirming your email address and resetting your password.",
                "Until that step is completed",
                "Strictly necessary",
              ],
              [
                "noryx_business",
                "Remembers which salon you're working in if you have access to several.",
                "Until you close the browser",
                "Strictly necessary",
              ],
              ["noryx_locale", "Remembers the language you choose (NL, FR or EN).", "1 year", "Functional, at your request"],
              ["noryx_cookie_consent", "Remembers your choice in the cookie banner (refuse or accept).", "6 months", "Strictly necessary"],
            ],
          },
        },
        {
          id: "consent",
          title: "Consent",
          paragraphs: [
            "The cookies above don't need consent: they're necessary or remember a choice you made yourself. In the cookie banner you choose whether we may also use other cookies in the future, such as for statistics. We don't use any at the moment, so refusing or accepting doesn't change how NORYX works. You can change your choice at any time through ‘Cookie settings’ at the bottom of the page. If we ever use such cookies, they will only load after your consent and we'll update this policy.",
          ],
        },
        {
          id: "third-parties",
          title: "No third-party cookies",
          paragraphs: [
            "We don't load scripts or content from third parties that set cookies: no ad networks, no social media buttons and no analytics services. The fonts come from our own server too.",
          ],
        },
        {
          id: "manage",
          title: "Deleting cookies",
          paragraphs: [
            "You can always delete or block cookies in your browser settings. If you block the cookies above, you can't sign in to NORYX.",
            `Questions? Use ${contact}. Read more about personal data in the [privacy policy](/privacy).`,
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Terms and conditions",
      title: "Terms and conditions",
      lead: "The agreement between NORYX and the salons, barbers and independent professionals who use NORYX.",
      sections: [
        {
          id: "scope",
          title: "Scope",
          paragraphs: [
            "These terms apply to every use of NORYX by a business or independent professional (‘the customer’). By creating an account you accept them, also on behalf of the business you represent. NORYX is meant for professional use.",
            "Anyone who books or orders with a salon makes that agreement with the salon, not with NORYX.",
          ],
        },
        {
          id: "service",
          title: "The service",
          paragraphs: [
            "NORYX is software in the browser for managing appointments, clients, team and business, with a public booking page. What the service includes is described on the website and on the [pricing page](/pricing). Features marked ‘In development’ aren't part of it yet.",
            "NORYX doesn't process payments itself and doesn't yet send emails or text messages on the salon's behalf. What is recorded in NORYX, such as payments taken at the salon, is a record, not bookkeeping or a VAT return.",
          ],
        },
        {
          id: "account",
          title: "Account and access",
          paragraphs: [],
          list: [
            "You provide correct details and keep them up to date.",
            "You keep your sign-in details secret. Every team member uses their own account.",
            "You're responsible for the team members you invite and the permissions you give them.",
            "If you suspect misuse of your account, tell us straight away.",
          ],
        },
        {
          id: "plans",
          title: "Trial, plans and prices",
          paragraphs: [
            "A new business gets 14 days of free access to Pro, without payment details. After that it continues on Basic, unless it chooses another plan.",
            "Monthly prices haven't been set yet. As long as paying through NORYX isn't possible, nothing is charged. We'll announce the prices and ask for your agreement before anything has to be paid.",
            "Extra options, such as an own domain with a custom webpage (one-time, Pro only) or a newsletter (monthly), are agreed separately and only delivered after you agree.",
          ],
        },
        {
          id: "use",
          title: "Using NORYX",
          paragraphs: ["You use NORYX in line with the law and these terms. In particular, you don't:"],
          list: [
            "store or spread unlawful content or data;",
            "send clients offers without their consent;",
            "try to access other people's data or disrupt the service;",
            "copy, resell or imitate the software.",
          ],
        },
        {
          id: "own-content",
          title: "Your responsibility as a salon",
          paragraphs: [
            "You set your own prices, your cancellation and gift card conditions and your communication with your clients, and make sure they comply with the law. You are the controller of your clients' data (see below).",
          ],
        },
        {
          id: "processing",
          title: "Data processing agreement",
          paragraphs: [
            "For the personal data of your clients and team members that you keep in NORYX, you are the controller and NORYX is the processor within the meaning of Article 28 of the General Data Protection Regulation (GDPR). This section is the data processing agreement.",
          ],
          list: [
            "**Subject and duration**: providing NORYX, for as long as your account exists.",
            "**Data and data subjects**: contact details, appointments, orders, gift cards, notes and payment records of your clients, and data of your team members such as name, email address, schedules and hours worked.",
            "**Instructions**: NORYX only processes the data to provide the service and on your instructions, as you give them through NORYX.",
            "**Confidentiality**: everyone at NORYX with access to data is bound to confidentiality.",
            "**Security**: appropriate technical and organisational measures, including encrypted connections, strict separation between salons in the database, roles and permissions, and an audit log.",
            "**Sub-processors**: Supabase (database, sign-in, storage) and Vercel (hosting). We announce a new sub-processor in advance; you can object.",
            "**Data subject rights**: NORYX provides tools to export or erase a client's data, and helps you with requests you receive.",
            "**Data breaches**: we report a personal data breach without undue delay, with the information you need for your own notifications.",
            "**End**: when the agreement ends you can export your data; after that we delete it, except what we're legally required to keep.",
            "**Audits**: we give you the information needed to check that we comply with these arrangements.",
          ],
        },
        {
          id: "availability",
          title: "Availability and support",
          paragraphs: [
            "We do our best to keep NORYX available at all times, but don't guarantee uninterrupted operation. The service may be briefly unavailable for maintenance. Support is available through the [Help page](/help).",
          ],
        },
        {
          id: "liability",
          title: "Liability",
          paragraphs: [
            "NORYX is liable for damage that is the direct result of a fault by NORYX. We're not liable for indirect damage, such as lost profit or lost clients, nor for damage caused by misuse, by data you enter yourself or by outages at third parties.",
            "Our liability is limited to the amounts you paid NORYX in the twelve months before the damage. These limitations don't apply in case of intent or fraud.",
          ],
        },
        {
          id: "ip",
          title: "Intellectual property",
          paragraphs: [
            "The software, the design and the NORYX name remain the property of NORYX. You get a non-transferable right to use NORYX for as long as your account exists. Your data and content remain yours.",
          ],
        },
        {
          id: "termination",
          title: "Term and termination",
          paragraphs: [
            "You can have your account closed at any time through the [contact form](/help#contact). You can export your data first.",
            "In case of serious or repeated breach of these terms or of abuse, we can suspend or close an account. Except in urgent cases, we'll tell you first.",
          ],
        },
        {
          id: "changes",
          title: "Changes",
          paragraphs: [
            "We may change these terms. We announce important changes at least 30 days in advance. If you keep using NORYX after that, the new terms apply.",
          ],
        },
        {
          id: "law",
          title: "Applicable law",
          paragraphs: [
            "These terms are governed by Belgian law. In case of a dispute we first look for a solution together; if that fails, the courts of the judicial district of NORYX's registered office have jurisdiction.",
          ],
        },
      ],
    },
    notice: {
      metaTitle: "Legal information",
      title: "Legal information",
      lead: "Who runs NORYX and how to reach us.",
      sections: [
        {
          id: "operator",
          title: "Operator",
          paragraphs: [],
          list: [
            `Name: ${c.name}`,
            `Legal form: ${c.legalForm}`,
            `Registered office: ${c.address}`,
            `Enterprise number (KBO): ${c.enterpriseNumber}`,
            ...(c.vatNumber ? [`VAT number: ${c.vatNumber}`] : []),
          ],
        },
        { id: "contact", title: "Contact", paragraphs: [`You can reach us through ${contact}.`] },
        {
          id: "hosting",
          title: "Hosting",
          paragraphs: [
            `The website is hosted by Vercel Inc. Data is stored with Supabase Inc., region ${c.dataRegion}.`,
          ],
        },
        {
          id: "documents",
          title: "Documents",
          paragraphs: [
            "See also the [privacy policy](/privacy), the [cookie policy](/cookies) and the [terms and conditions](/terms).",
          ],
        },
      ],
    },
  };
}
