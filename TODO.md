# TODO & Feature Roadmap

This file tracks architectural decisions, outstanding features, and future enhancements for the Financas application.

## 0. Immediate Priorities

- [/] **Credit Card Support**:
  - [ ] Check "Pagamento de Fatura" event in the timeline after creating a transfer to a credit card account (Trigger fixed and UI support added).
  - [x] Create specialized UI for credit card accounts (Forms + Details View)
  - [ ] Implement specialized logic for credit limits and billing cycles. See [Credit Card Planning](file:///home/emerson/.gemini/antigravity/brain/5bf21acd-affb-4d92-a462-ce0825831f31/credit_card_planning.md).

## 1. Core Financial Features

### 1.1 Transaction Splits

**Status**: Schema Placeholder Defined

- [ ] Implement UI for splitting a single transaction across multiple categories/users.
- [ ] Add backend validation to ensure split sums match parent transaction.
- [ ] Define group-sharing logic for split visibility.

### 1.2 Recurring Transactions

**Status**: Not Started

- [ ] Create `recurring_templates` table to store schedule logic (daily, monthly, yearly).
- [ ] Implement a background job (or edge function) to generate transactions from templates.
- [ ] UI for managing and skipping recurring transactions.

### 1.3 Advanced Timeline & Reporting

**Status**: Basic Filters Implemented

- [ ] **Search**: Full-text search across transaction names and descriptions.
- [ ] **Advanced Filters**: Date range picker, account multi-select, and category sub-filters.
- [ ] **AI Categorization**: Integrate an LLM to automatically suggest categories based on transaction metadata.
- [ ] **PDF/Excel Export**: Expand export options beyond CSV/JSON for formal reporting.

## 2. User Experience & Growth

### 2.1 User Navigation Phase 3

**Status**: Phase 2 (UI Polish) Completed

- [ ] **Notifications (`⌘N`)**: Implement real-time alerts using Supabase Realtime for budget alerts and group invitations.
- [ ] **Help Center**: Create a dedicated `/help` page with FAQs and onboarding guides.
- [ ] **Feedback Loop**: Implement a structured form to collect user feedback and bug reports.
- [ ] **Referral Program**: Incentivize user growth with a referral system (e.g., shareable links, "Pro" months for successful invites).

### 2.2 Dashboard Analytics

**Status**: Basic Views Implemented

- [ ] Implement "Cash Flow" chart (Income vs Expenses) on the home page.
- [ ] Category spending distribution (Donut/Pie charts).
- [ ] Savings goal progress trackers.

## 3. Subscriptions & Tier Logic

**Status**: UI Placeholder ("PRO" Badge) Implemented

- [ ] **Subscription Engine**: Integrate Stripe for plan management and billing.
- [ ] **Feature Gating**: Limit access to advanced reports or AI categorization based on user tier.
- [ ] **Customer Portal**: Direct link from `UserNav` to Stripe's self-service portal.

## 4. Infrastructure & Security

### 4.1 Enhanced Group Sharing

**Status**: Basic Membership Implemented

- [ ] Refine RLS policies for granular group permissions (Owner, Editor, Viewer).
- [ ] Implement "Invite User" flow via email/link.

### 4.2 Audit & Activity Logging

**Status**: `activity_log` Table Created

- [ ] Expand activity logging to include sensitive actions (deleting accounts, changing roles).
- [ ] UI for users to view their own security and activity history.

## 5. Mobile & Performance

- [ ] **Mobile Polish**: Final pass on all complex tables and charts for mobile responsiveness.
- [ ] **PWA Support**: Configure manifest and service workers for "Install as App" experience.
- [ ] **Query Optimization**: Perform load testing on `unified_timeline` view for large datasets.

## 6. Transactions form

- [ ] after inserting a new transaction we need to flush our query provider? info is not up to date after we create one.
- [x] account select the ONLY option if ONLY one is available.

## 7. Perf

- [ ] Interaction to Next Paint: 464 ms (/dashboard/transactions/new)
- [ ] Interaction to Next Paint: 952 ms (/dashboard/settings)

## 8. Import data page

- [ ] long scroll to find the buttons, poor UX
- [ ] why don't we categorize stuff?
- [ ] after importing we dont show default category "desconhecido" badge at transaction list

## 9. Budget Default

- [ ] We could improve onboarding so customer already have at least one budget available
- [ ] Budget Form is using wrong date format, not using locale

## 10. Transaction details

- [x] Tipo de Conta shows nothing, why? empty badge

## 11. Transaction edit

- [x] weird UI, completely off the way

## 12. Transaction list

- [ ] We shoul;d be able to deactivate the sorting, one click, sort, second click, sort again other direction, other click undo both sorting

## 13. Datatable component

- [ ] sorting icon for what?
- [ ] search box trigger entire component rerender, not just the list

# 14. Account details:

- [ ] Maybe we want a timeline here?
- [ ] UI is odd

## 15. user_accounts_with_balance=> @20241214000000_initial_schema.sql#L121-128 would be too bad to have expenses and incomes as well, and to have a whey to filter by month?

## 16. duplicated transactions

- [ ] how can we prevent those?
- [ ] how can we prevent importing the same file using importar feature?
- [ ] how can we prevent importing the same transactions from the same file?

## 17. Improve breadcumb

- [] we shouldn't show internal IDs.

## 18. Dashboard

- [] Transações recentes section is not in line with the dashboard section, how can we improve?

## 19. New account form

- [ ] IT DOESN't WORK AT MOBILE!!!! WE NEED TO FIX THIS ASAP. THERE IS NO SCROLL. made we need to move away from a modal strategy
