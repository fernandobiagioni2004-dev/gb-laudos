
## Plataforma de Laudos — Implementation Plan

### Overview
A complete frontend-only SaaS dashboard for managing dental radiology reports, with three simulated user roles, full navigation, mock data, and financial calculations — all running in local state with no backend.

---

### 1. Role Switcher & App Shell
- A persistent role selector at the top of the sidebar to switch between **Admin**, **Radiologista**, and **Usuário Externo**
- Switching roles dynamically changes the sidebar navigation and visible screens
- Loading skeleton animation when switching profiles
- Dark mode only, Inter font, shadcn/ui components throughout

---

### 2. Sidebar Navigation (Dark Mode)
- Fixed left sidebar with role-based menus:
  - **Admin**: Dashboard, Exames, Clientes, Radiologistas, Tabelas de Preço, Relatórios, Meu Perfil
  - **Radiologista**: Exames Disponíveis, Meus Exames, Meu Financeiro, Meu Perfil
  - **Usuário Externo**: Novo Exame, Meus Exames, Meu Perfil
- Active route highlight, collapsible mini-sidebar

---

### 3. Mock Data Layer
- **3 clients** with CNPJ, email, status
- **3 exam types** (e.g., Panorâmica, Tomografia, Periapical)
- **4 radiologists**: 2 with Axel access, 2 with Morita access
- **20 pre-built exams** with varied clients, software, statuses, and dynamically calculated financial values
- Pricing matrix: Client + Exam Type → Client value; Client + Exam Type + Radiologist → Payment value
- All margin calculations: `margem = valor_cliente - valor_radiologista`

---

### 4. Admin — Dashboard
- Period filter: Hoje / 7 dias / 30 dias / Total
- KPI cards: Total exams, Total revenue, Total paid to radiologists, Total margin, Average ticket, Active clients
- Line charts: Exams per day, Revenue per day (using Recharts)
- Production table: Radiologist name, exam count, value generated, amount to receive

---

### 5. Admin — Exam Management
- Full table with: ID, Client, Patient, Exam Type, Software, Radiologist, Status, Client Value, Radiologist Value, Margin
- Color-coded status badges: Disponível / Em análise / Finalizado / Cancelado
- Actions: Edit, Change status, Assign radiologist, View details
- Exam detail panel/modal: Patient data, simulated files, status history, financial values

---

### 6. Admin — Clients & Radiologists
- **Clients table**: Name, CNPJ, Email, Status, Total Revenue, Margin — with detail view showing exam history and accumulated financials
- **Radiologists table**: Name, Email, Enabled software, Exams completed, Amount receivable — with detail view showing exam list and financial summary

---

### 7. Admin — Pricing Tables
- Select client + exam type → set client value
- Set different payment values per radiologist
- Live margin preview as values are entered

---

### 8. Admin — Reports
- Radiologist report: Period + client + exam type filters, quantity, unit value, total, simulated CSV export button
- Client report: Revenue, total paid, margin breakdown

---

### 9. Radiologist — Exam Flow
- **Exames Disponíveis**: Shows only exams compatible with the simulated radiologist's software (Axel or Morita) — "Assumir exame" button
- On assumption: status changes to "Em análise", radiologist is assigned, success toast shown
- **Meus Exames**: List of assigned exams, "Finalizar" action with simulated report upload, confirmation modal before finalizing

---

### 10. External User — Exam Submission
- **Novo Exame** form: Client (mock selector), patient name, birth date, exam type, software used, observations, simulated file upload
- Submit → exam created with "Disponível" status + success toast
- **Meus Exames**: Status list with simulated download button when exam is "Finalizado"
- No financial data visible to external users

---

### 11. UX & Microinteractions
- Toast notifications for: assuming exam, finalizing exam, submitting exam, status changes
- Confirmation modals for critical actions (cancel exam, finalize)
- Empty states with illustrations for all list screens
- Loading skeletons on role switch
- Animated status badge transitions
- Responsive layout, generous spacing, soft card borders, subtle animations
