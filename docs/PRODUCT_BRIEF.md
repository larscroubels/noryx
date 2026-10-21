# NORYX — Build a Complete, Premium SaaS Platform for Beauty Businesses

> Original product brief supplied by the product owner (21 October 2026). Kept verbatim as the source of requirements. Progress is tracked in [`ROADMAP.md`](ROADMAP.md).

## 1. Project overview

I want to build **NORYX**, a complete, modern and commercially viable SaaS platform for beauty businesses.

NORYX is an all-in-one business management platform for:

- Hairdressers and hair salons.
- Barbers and barbershops.
- Beauty salons.
- Nail studios.
- Lash and brow studios.
- Skincare and aesthetic treatment businesses.
- Independent beauty professionals.
- Multi-location beauty businesses with several employees.

The platform must help beauty entrepreneurs manage their entire business in one place, including appointments, staff, customers, services, products, online sales, administration, business performance and customer communication.

This must not be just a simple booking calendar. The long-term goal is to build a complete business ecosystem for beauty professionals, with a professional web application first and native mobile applications for iOS and Android as a future expansion.

The product should feel like a serious international SaaS company from day one.

The quality bar should be comparable to modern software companies such as Stripe, Shopify and Vercel in terms of clarity, usability, reliability, consistency and attention to detail, while having its own distinctive beauty-focused identity.

**Important: Do not create a superficial demo with buttons that do nothing. Build real, connected functionality incrementally, with persistent data, proper validation, permissions and a scalable architecture.**

---

## 2. Official brand identity and supplied logos

The official brand name is **NORYX**.

I have added the NORYX logo files to the project. Inspect the available project files and use the supplied logos as the official brand assets.

Do not redesign, recreate or replace the logos unless I explicitly ask you to.

The latest logo uses an elegant combination of champagne metallic tones, rose gold and deep burgundy. The visual identity must be based on that logo.

If both a complete wordmark and a standalone N/X symbol are available, use them appropriately:

- Full wordmark for the website header, landing page and selected brand presentations.
- Standalone N/X symbol for compact navigation, the app icon, favicon and smaller interface elements.
- Use the original assets wherever possible instead of approximating them with text or CSS.

If the logo files cannot be found, report this clearly instead of silently inventing a replacement.

### 2.1 The desired visual identity

The website must be **bright, elegant, welcoming, optimistic, modern and luxurious**.

I do not want a dark, gloomy or overly serious website. NORYX should look like a positive and ambitious beauty-tech company that customers and entrepreneurs enjoy using.

The foundation of the design must be light.

Use the following colour direction:

- **Primary background:** clean white.
- **Secondary background:** warm ivory and very light champagne.
- **Primary brand accent:** refined rose gold inspired by the supplied logo.
- **Secondary accent:** soft champagne and muted metallic gold.
- **Signature accent:** deep burgundy, used selectively.
- **Main text:** dark charcoal or near-black for readability.
- **Secondary text:** sophisticated neutral grey.
- **Borders:** very light warm grey.
- **Success states:** accessible green tones.
- **Warning and error states:** clear, accessible colours that remain consistent with the overall design.

Suggested starting colours:

- White: `#FFFFFF`
- Warm ivory: `#FBF8F5`
- Soft champagne: `#EAD8C8`
- Rose gold: `#C58D83`
- Muted rose: `#E6C5BE`
- Deep burgundy: `#741F32`
- Charcoal: `#292626`
- Secondary grey: `#77716F`
- Light border: `#EAE4E0`

These are initial design tokens, not rigid limitations. Refine them to match the supplied logo and maintain consistent contrast.

Do not use every accent colour everywhere. White should dominate, rose gold should add elegance, champagne should add warmth and burgundy should provide selective emphasis.

### 2.2 What the design should feel like

Imagine a modern, beautifully designed beauty business platform with:

- Generous white space.
- Clear, refined typography.
- Elegant but restrained rounded corners.
- Clean cards and well-structured layouts.
- Subtle shadows rather than heavy borders.
- Carefully designed buttons.
- Beautiful forms and booking flows.
- Smooth and purposeful transitions.
- Small rose-gold details that connect the interface to the brand.
- Friendly illustrations or visual elements only when they genuinely improve the experience.
- A consistent, polished interface across desktop, tablet and mobile.

Use rose gold as a sophisticated accent, not as a full metallic texture on every button and component.

Avoid:

- Entirely black or dark website sections.
- Large dark hero backgrounds.
- Excessive gradients and glowing effects.
- Gold or rose-gold text on white when the contrast is insufficient.
- Generic template layouts.
- Unnecessary glassmorphism.
- Excessive animation.
- Huge decorative elements that interfere with usability.
- Cluttered dashboards.
- Inconsistent spacing or typography.
- Emoji used as a substitute for professional icons.
- Artificial-looking AI-generated interface patterns.

The result should be luxurious but approachable, visually distinctive but practical, and modern without becoming complicated.

### 2.3 Design system

Create a reusable design system containing:

- Colour tokens.
- Typography scales.
- Spacing rules.
- Border-radius values.
- Shadows.
- Buttons and button states.
- Form controls.
- Input validation states.
- Cards and panels.
- Modals and dialogs.
- Tables.
- Dropdown menus.
- Tooltips.
- Notifications and toast messages.
- Badges and status indicators.
- Loading states.
- Empty states.
- Error states.
- Navigation elements.
- Responsive breakpoints.

All pages should use the same design system. Do not create different styles independently for each page.

---

## 3. Product structure

NORYX should be divided into several connected experiences.

### A. Public marketing website

A professional website introducing NORYX, explaining its benefits and encouraging beauty entrepreneurs to sign up.

### B. Salon owner dashboard

The main business management environment for entrepreneurs who manage a salon or beauty business.

### C. Staff portal

An environment where employees can view their own schedule, appointments and authorised business information.

### D. Customer booking experience

A fast, mobile-friendly experience where customers can find services, choose a staff member, select an available time and book an appointment.

### E. Customer account portal

An optional account area where customers can manage appointments, view booking history and update their details.

### F. Platform administration

A secure administration environment for the NORYX platform operator to manage businesses, subscriptions, system configuration and platform-wide statistics.

### G. Future mobile applications

The architecture must make it possible to introduce iOS and Android applications later without rebuilding the entire backend.

Each experience must have a consistent design language, while navigation and permissions should be appropriate to the user's role.

---

## 4. User roles and permissions

Implement role-based access control.

### 4.1 Platform administrator

The platform administrator can manage:

- Registered businesses.
- Business account statuses.
- Subscription plans.
- Subscription statuses.
- Platform-wide usage statistics.
- System configuration.
- Support and operational information.
- Feature availability.
- Relevant platform audit records.

Platform administration must be protected and never accessible to ordinary salon users.

### 4.2 Salon owner

The salon owner can manage:

- Business profile and branding.
- Locations.
- Employees and permissions.
- Services and prices.
- Opening hours.
- Appointment settings.
- Customer records.
- Products and inventory.
- Orders.
- Expenses and financial records.
- Reports and exports.
- Booking page customisation.
- Business settings.
- Subscription and billing information.

### 4.3 Staff member

Staff members should only see the functionality they are authorised to access.

Depending on permissions, they may be able to:

- View their own calendar.
- View assigned appointments.
- Confirm or update appointments.
- Manage their availability.
- View relevant customer details.
- View assigned services.
- Record appointment completion.
- Access selected business information.

Do not expose the owner's financial information to every employee by default.

### 4.4 Customer

Customers can:

- Browse public booking pages.
- View services and prices.
- Choose a location and staff member where applicable.
- Book appointments.
- Receive confirmations.
- Cancel or reschedule within the business's rules.
- View their booking history.
- Manage their profile if they have an account.
- Browse products and place orders when webshop functionality is enabled.

Allow guest booking where configured by the business.

### 4.5 Strict permission enforcement

Enforce all permissions on the server and at the database level where supported.

Hiding a button in the interface is not sufficient security.

A user must never be able to access another business's records by changing a URL, identifier or API request.

---

## 5. Authentication and onboarding

Implement a reliable authentication system.

Include:

- Registration.
- Login.
- Logout.
- Password reset.
- Email verification where supported.
- Secure session management.
- Protected application routes.
- Appropriate authentication error messages.
- Role-aware redirects.
- Account settings.
- Secure handling of expired sessions.

### Business onboarding

Create a guided onboarding flow for new salon owners.

Collect relevant information such as:

1. Business name.
2. Business type.
3. Business location and contact information.
4. Business logo and optional brand colours.
5. Opening hours.
6. Initial services and prices.
7. Employees, if applicable.
8. Booking preferences.
9. Public booking page settings.

Make onboarding feel simple and welcoming.

Allow users to save progress where practical. Do not force them to configure every advanced feature before they can start using the core application.

After onboarding, guide the user to the dashboard with clear next steps.

---

## 6. Multi-tenant SaaS architecture

NORYX must support many independent businesses on the same platform.

Every business should have its own:

- Business profile.
- Staff.
- Locations.
- Services.
- Appointments.
- Customers.
- Products.
- Orders.
- Financial records.
- Reports.
- Settings.
- Branding.
- Subscription.

Design the database so that business-owned records are associated with the correct tenant.

Implement tenant isolation using appropriate database constraints, server-side checks and row-level security where supported.

Do not rely solely on frontend filters.

Make it possible for one business to operate multiple locations without mixing schedules, inventory, staff assignments or reports.

The architecture must be suitable for future subscription growth, more users, more appointments and larger businesses.

---

## 7. Appointment booking system

The booking system is one of the most important parts of NORYX.

Build it carefully and make it genuinely usable.

### 7.1 Public booking flow

A typical booking flow should allow the customer to:

1. Open a salon's booking page.
2. Select a service or treatment.
3. Select a location if the business has multiple locations.
4. Select a staff member or choose the first available professional.
5. Choose a date.
6. View available time slots.
7. Enter contact details or sign in.
8. Review the booking.
9. Confirm the appointment.
10. Receive a confirmation when the required notification service is configured.

Keep the booking flow simple, elegant and mobile-first.

Display service descriptions, durations, prices and relevant staff information clearly.

### 7.2 Availability engine

Calculate available appointment slots using:

- Business opening hours.
- Location opening hours.
- Staff working hours.
- Staff availability.
- Staff breaks.
- Holidays and days off.
- Existing appointments.
- Service duration.
- Configurable buffers between appointments.
- Relevant booking restrictions.
- The business's booking horizon.
- Any enabled resource requirements.

Prevent overlapping appointments and double bookings.

Perform critical availability checks on the server at booking time. Do not trust availability calculated only in the browser.

Handle simultaneous booking attempts safely using appropriate database transactions or constraints.

### 7.3 Appointment management

Provide:

- Daily calendar.
- Weekly calendar.
- Monthly calendar.
- Staff-specific views.
- Location-specific views.
- Search and filtering.
- Appointment details.
- Booking status.
- Rescheduling.
- Cancellation.
- Appointment completion.
- No-show tracking where appropriate.
- Internal notes with appropriate permissions.
- Appointment history.

Use clear visual indicators for statuses such as pending, confirmed, completed, cancelled and no-show.

Do not rely on colour alone to communicate status.

### 7.4 Booking policies

Allow businesses to configure:

- Minimum notice before booking.
- Maximum booking horizon.
- Cancellation deadline.
- Rescheduling rules.
- Buffer time.
- Whether customers can choose their staff member.
- Whether staff approval is required.
- Whether online payments or deposits are enabled.

Only offer payment functionality when a real payment integration is configured.

### 7.5 Notifications

Prepare the system for:

- Booking confirmations.
- Booking changes.
- Cancellation notifications.
- Appointment reminders.
- Staff notifications.
- Email notifications.
- Future SMS or messaging integrations.

Create a reliable notification architecture with delivery status and error handling.

Do not pretend that emails or messages were sent if no provider is configured.

---

## 8. Staff management

Create a complete staff management module.

Each staff profile may include:

- Name.
- Profile photo.
- Contact information.
- Job title.
- Assigned location.
- Active or inactive status.
- Services they can perform.
- Working hours.
- Breaks.
- Holidays and leave.
- Appointment calendar.
- Relevant permissions.
- Optional commission settings.

Allow owners to add, edit, deactivate and manage employees.

An employee's availability must be reflected in the booking engine.

Support part-time schedules and different working hours on different days.

Keep employee data private and accessible only to authorised users.

---

## 9. Services and pricing

Allow businesses to create and manage their services.

Each service should support:

- Name.
- Description.
- Category.
- Duration.
- Price.
- Optional promotional price.
- Assigned staff members.
- Active or inactive status.
- Booking visibility.
- Optional buffer time.
- Optional image.

Examples include haircuts, colouring, styling, manicures, pedicures, facials, massages, brows and lashes.

Support different durations and prices for different staff members if the business requires it.

Make it easy to organise services into categories.

Changes to services must be reflected correctly in the public booking experience.

Preserve historical appointment information when a service is later renamed, edited or deactivated.

---

## 10. Customer management and CRM

Build a useful customer management module.

Customer profiles may include:

- Name.
- Email address.
- Telephone number.
- Relevant contact preferences.
- Appointment history.
- Upcoming appointments.
- Customer notes.
- Purchase history where applicable.
- Account status.
- Date of creation.

Include:

- Customer search.
- Filtering.
- Sorting.
- Customer detail pages.
- Booking history.
- Relevant customer statistics.
- Duplicate prevention where practical.
- Controlled access to sensitive notes.

Do not collect unnecessary personal information.

Support customer data export and deletion workflows where legally appropriate.

Do not store payment card details directly.

---

## 11. Products, inventory and webshop

NORYX should allow beauty businesses to manage retail products alongside their services.

### Product management

Support:

- Product name.
- Description.
- Images.
- SKU or internal product code.
- Category.
- Selling price.
- Purchase cost where applicable.
- Stock quantity.
- Low-stock threshold.
- Active or inactive status.
- Optional variants such as size or colour.

### Inventory

Include:

- Stock adjustments.
- Stock movement history.
- Low-stock warnings.
- Stock search and filtering.
- Appropriate permission controls.
- Prevention of invalid negative stock quantities unless explicitly supported by the business rules.

### Webshop

Allow businesses to publish selected products on their public page.

The webshop should support:

- Product listing.
- Product details.
- Shopping cart.
- Order creation.
- Order history.
- Order status.
- Inventory updates.
- Customer contact details.
- Shipping or collection settings where implemented.

If online payments are added, integrate a proper payment provider using secure server-side workflows.

Do not store card information or invent successful payment results.

Clearly distinguish between orders that are unpaid, paid, cancelled, refunded or otherwise processed.

---

## 12. Financial management and administration

Create a financial module suitable for everyday business management.

It should include:

- Revenue overview.
- Expense tracking.
- Sales records.
- Appointment-related revenue.
- Product sales.
- Payment statuses.
- Refund records where supported.
- Financial summaries.
- Date-range filtering.
- Export functionality.
- Clear separation of estimates and actual recorded amounts.

### Expense management

Allow authorised users to record:

- Description.
- Category.
- Amount.
- Date.
- Supplier where applicable.
- Optional reference.
- Optional attachment if file storage is implemented securely.

### Reporting

Provide reports for:

- Revenue by period.
- Revenue by service.
- Revenue by employee.
- Revenue by location.
- Product sales.
- Appointment counts.
- Cancellations.
- No-shows.
- Expenses.
- Recorded profit estimates where the necessary cost data exists.

Provide CSV exports and other formats only when they can be generated reliably.

Make financial summaries consistent with the underlying transaction records.

Do not describe basic revenue summaries as fully compliant accounting software.

Do not claim automatic VAT filing, official bookkeeping compliance or legal certification without implementing and validating the relevant requirements.

Support European businesses and currency settings, with EUR as an appropriate default for Belgian businesses.

Keep financial data accessible only to authorised roles.

---

## 13. Custom branding and public business pages

Each business should have a public page that reflects its identity.

Allow the owner to configure:

- Business name.
- Logo.
- Cover image.
- Contact information.
- Address and location details.
- Opening hours.
- Services.
- Prices.
- Staff profiles.
- Booking availability.
- Optional product shop.
- Social links.
- Selected accent colours.

Provide a live preview where practical.

Customisation must never compromise readability or accessibility.

The NORYX product interface should maintain its own brand identity, while each business can personalise its public-facing page.

Prepare the architecture for future custom domains and more advanced white-label features.

---

## 14. Dashboard and analytics

Build a professional dashboard that provides useful information at a glance.

Depending on the role and permissions, show:

- Today's appointments.
- Upcoming appointments.
- Available staff.
- Appointment counts.
- Revenue for the selected period.
- Booking trends.
- Popular services.
- Customer activity.
- Product stock warnings.
- Recent orders.
- Relevant tasks or notifications.

Use real data from the database.

When a business has no data yet, show a helpful empty state explaining how to get started.

Do not fill the dashboard with invented statistics.

Charts should be clear, responsive and easy to understand.

Allow relevant date-range filters.

Keep the interface uncluttered and prioritise the information that helps the business owner make decisions.

---

## 15. Subscription and billing architecture

NORYX is intended to become a subscription-based SaaS business.

Prepare for configurable subscription plans.

Possible future plans may differ by:

- Number of employees.
- Number of locations.
- Appointment volume.
- Available features.
- Webshop functionality.
- Reporting features.
- Branding options.
- Integrations.

Implement subscription status handling and feature entitlements in a maintainable way.

The platform administrator should be able to manage plans and business subscriptions.

If payment processing for subscriptions is not yet configured, build the appropriate architecture and clearly mark billing as requiring integration.

Do not invent payment confirmations, subscription upgrades or invoices.

Do not hardcode subscription restrictions throughout the application. Centralise plan and feature logic.

---

## 16. Platform administrator dashboard

Create a separate, secure platform administration area.

Include:

- Business overview.
- Registered business counts.
- Account status management.
- Subscription overview.
- Platform usage statistics.
- Support-related information.
- Feature configuration.
- Relevant system events.
- Audit history for important administrative actions.

Only authorised platform administrators should be able to access this area.

Do not create an insecure hidden URL as the only protection.

All administrative actions must be checked on the server.

---

## 17. Public marketing website

Create a polished landing page that introduces NORYX.

The landing page should use the new bright, luxurious design system.

### Suggested sections

1. Header with the official NORYX logo.
2. Hero section with a compelling headline.
3. Short explanation of the product.
4. Primary call to action to get started.
5. Secondary action to explore the platform.
6. Feature overview.
7. Appointment management benefits.
8. Staff and customer management benefits.
9. Webshop and financial management benefits.
10. A product preview or dashboard presentation.
11. Benefits for different beauty business types.
12. Subscription section when real plans are defined.
13. Frequently asked questions.
14. Final call to action.
15. Professional footer.

Use concise, persuasive copy.

Do not invent customer testimonials, business partnerships, user counts, awards or performance claims.

If a feature is not yet implemented, do not present it as an available feature.

The hero section should be bright and welcoming, with white or warm ivory backgrounds, charcoal text and carefully applied rose-gold and burgundy accents.

Avoid the typical dark SaaS landing page aesthetic.

The website should feel premium, positive and trustworthy.

---

## 18. Technical architecture

First inspect the current repository before making changes.

Determine:

- Which framework is being used.
- Which dependencies are installed.
- Which routes and components already exist.
- Whether authentication has been configured.
- Whether a database connection exists.
- Which logo and brand files are available.
- Which features are already implemented.
- Whether there are existing bugs or incomplete components.

Do not overwrite useful existing work without understanding it.

### Recommended stack if the project is not yet configured

- Next.js with TypeScript.
- React.
- Tailwind CSS.
- A consistent reusable component library.
- Supabase for PostgreSQL, authentication and storage.
- Database migrations.
- Server-side validation.
- Row-level security where appropriate.
- A suitable chart library for reporting.
- Automated testing where practical.

Use the existing stack if it is already appropriate and functional. Do not migrate technologies unnecessarily.

### Code quality

Write clean, maintainable and understandable code.

Use:

- Reusable components.
- Clear module boundaries.
- Meaningful variable and function names.
- Strong TypeScript types.
- Centralised validation schemas.
- Consistent error handling.
- Shared design tokens.
- Well-defined data models.
- Database migrations.
- Appropriate logging.
- Clear documentation.

Avoid giant components, duplicated logic, unnecessary abstractions and overly complicated architecture.

Do not add dependencies without a clear reason.

Do not put secrets in frontend code or commit private credentials.

Use environment variables and provide an example environment file containing placeholder values only.

---

## 19. Suggested data model

Design a database schema that supports the following entities where appropriate:

- Users.
- Businesses.
- Business memberships.
- Roles and permissions.
- Locations.
- Staff profiles.
- Staff working hours.
- Staff leave and breaks.
- Services.
- Service categories.
- Staff-service assignments.
- Customers.
- Customer-business relationships where needed.
- Appointments.
- Appointment status history.
- Products.
- Product variants.
- Inventory movements.
- Orders.
- Order items.
- Payments and payment statuses.
- Expenses.
- Financial transactions.
- Subscription plans.
- Business subscriptions.
- Notifications.
- Business settings.
- Audit events.

This is a starting point, not a requirement to create unnecessary tables. Refine the model based on actual functionality and relationships.

Use foreign keys, indexes, appropriate uniqueness constraints and sensible deletion rules.

Store timestamps consistently and display them in the relevant business's local timezone.

For European users, consider date formats, currency formatting and local time handling.

Preserve relevant historical data when records are deactivated or modified.

---

## 20. Security, privacy and GDPR

NORYX is intended for European businesses and may process personal information about customers and employees.

Build with privacy and security in mind.

Implement appropriate measures for:

- Authentication.
- Server-side authorisation.
- Tenant isolation.
- Input validation.
- Secure session handling.
- Database access controls.
- Secure file uploads.
- Rate limiting where appropriate.
- Protection against common web vulnerabilities.
- Safe error messages.
- Logging without unnecessary personal data.
- Data export and deletion workflows.
- Privacy settings and consent where required.
- Appropriate retention policies.
- Secure secret management.

Prepare for GDPR-related requirements, including transparent privacy information, data minimisation, data subject requests and appropriate retention and deletion procedures.

Do not claim that the product is automatically GDPR-compliant simply because these features exist.

Avoid collecting sensitive personal information unless genuinely necessary.

Do not store payment card details directly.

---

## 21. Accessibility and responsive behaviour

The platform must work well on:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile phones.

The booking experience should be particularly easy to use on mobile.

Implement:

- Responsive navigation.
- Accessible form labels.
- Keyboard navigation.
- Visible focus states.
- Appropriate contrast.
- Clear validation messages.
- Touch-friendly controls.
- Semantic HTML.
- Accessible dialogs and menus.
- Reduced-motion support where appropriate.

Never rely only on colour to communicate errors, booking statuses or other important information.

The rose-gold and champagne colours must remain readable against their backgrounds.

If a metallic accent has insufficient contrast for text, use charcoal text or reserve the metallic colour for decorative elements.

---

## 22. Performance and reliability

Build the platform so it remains responsive as the amount of data grows.

Consider:

- Efficient database queries.
- Pagination for large lists.
- Appropriate indexing.
- Avoiding unnecessary client-side rendering.
- Optimised images.
- Lazy loading where appropriate.
- Sensible caching.
- Reliable error handling.
- Safe handling of concurrent bookings.
- Transactional updates for critical operations.

Do not sacrifice correctness for visual effects.

The booking system and financial records must remain consistent.

---

## 23. Testing and quality assurance

Test the application throughout development.

At minimum, check:

- Registration and login.
- Role permissions.
- Tenant isolation.
- Business onboarding.
- Service creation and editing.
- Staff availability.
- Appointment booking.
- Double-booking prevention.
- Appointment rescheduling and cancellation.
- Customer records.
- Product and inventory updates.
- Order processing.
- Financial calculations.
- Data exports.
- Responsive layouts.
- Error and empty states.

Use automated tests for important business rules where practical.

Run the available linting, type checking, build checks and relevant tests.

Fix errors introduced by your changes.

Do not claim that functionality has been tested if it has not been tested.

---

## 24. Development roadmap

Do not attempt to build the entire platform in one unstructured operation.

Work in phases and keep the application usable after each phase.

### Phase 1: Project audit and foundation

- Inspect the repository.
- Identify existing functionality.
- Inspect all supplied NORYX logo files.
- Establish the bright white, rose-gold and burgundy design system.
- Set up or improve the application architecture.
- Configure reusable components.
- Establish environment variable handling.
- Prepare the database and authentication architecture.

### Phase 2: Public website and authentication

- Build the landing page.
- Implement registration and login.
- Add protected routes.
- Create role-aware navigation.
- Implement the initial business onboarding flow.

### Phase 3: Core business management

- Business settings.
- Services and categories.
- Staff profiles.
- Working hours and availability.
- Customer management.
- Dashboard.

### Phase 4: Booking system

- Public booking pages.
- Availability engine.
- Appointment calendar.
- Booking creation.
- Rescheduling and cancellation.
- Booking statuses.
- Confirmation architecture.

### Phase 5: Products and webshop

- Product management.
- Inventory.
- Public product catalogue.
- Shopping cart.
- Order management.
- Payment integration when configured.

### Phase 6: Finance and reporting

- Revenue records.
- Expenses.
- Financial summaries.
- Reports.
- CSV exports.
- Data validation.

### Phase 7: SaaS administration

- Platform administrator dashboard.
- Subscription architecture.
- Feature entitlements.
- Business management.
- Operational monitoring.

### Phase 8: Refinement and launch preparation

- Responsive design review.
- Accessibility checks.
- Security review.
- Automated tests.
- Performance improvements.
- Error handling.
- Documentation.
- Deployment configuration.

Adjust the order when dependencies or the existing codebase require it.

Do not skip security and data integrity in favour of visual progress.

---

## 25. Working instructions for Claude Code

Follow these instructions throughout the project.

1. Start by inspecting the existing codebase and project files.
2. Locate and inspect the supplied NORYX logos before designing the interface.
3. Preserve existing functionality unless there is a clear reason to change it.
4. Build a consistent design system before creating many independent pages.
5. Use white and warm ivory as the primary surfaces, with rose gold, champagne and restrained burgundy accents.
6. Keep the experience bright, welcoming, elegant and luxurious.
7. Make the application responsive from the beginning.
8. Build real functionality rather than static mockups wherever the current phase requires it.
9. Validate all important operations on the server.
10. Enforce permissions and tenant isolation.
11. Do not invent data, successful transactions, sent notifications or completed integrations.
12. Use clear loading, error, success and empty states.
13. Run relevant checks after meaningful changes.
14. Fix problems caused by your implementation.
15. Explain any missing external configuration clearly.
16. Keep documentation and environment examples up to date.
17. Do not expose credentials or secrets.
18. Avoid unnecessary rewrites or dependency changes.
19. Keep each implementation phase focused and testable.
20. Make reasonable technical decisions independently when they are consistent with this brief, and document important trade-offs.

### First task

Do not immediately try to implement every feature.

Begin by auditing the repository and identifying the existing code, project structure, dependencies, routes, database configuration, authentication, current functionality and supplied logo files.

Then provide a concise implementation plan based on what actually exists.

After that, implement the highest-priority next step, starting with the design foundation and application structure. If the project already contains a working foundation, improve it rather than rebuilding it unnecessarily.

At the end of the work, report:

- What you inspected.
- What you changed.
- Which features work.
- Which tests and checks you ran.
- What remains incomplete.
- Which external services or environment variables still need configuration.

## Final objective

Build **NORYX** into a reliable, secure, scalable and commercially viable all-in-one SaaS platform for beauty businesses.

The visual identity must be unmistakable: a bright white and warm ivory foundation, elegant rose-gold details, subtle champagne tones and carefully placed burgundy accents, all inspired by the supplied NORYX logo.

The finished product should feel like a modern, friendly and ambitious beauty-tech company: premium without being intimidating, luxurious without being dark, minimal without feeling empty, and powerful without becoming complicated.
