# Gutter Estimator

A dynamic, spreadsheet-like estimating tool for sheet metal fabrication, custom gutter parts, and gutter shell manufacturing. Built with React 19, TypeScript, Vite, Tailwind CSS, and Cloud Firestore.

## 🚀 Live Cloud Deployment

* **Production URL:** [https://gutter-estimator-pro.web.app](https://gutter-estimator-pro.web.app)
* **Status:** Always On &bull; Cloud Persistence Active

---

## ✨ Features

* **Gutter Shell Estimator:** Dynamic cost breakdown factoring in material gauge, coil type (including customer coil bypass), order linear footage, slit charges, freight, labor pricing tiers, and 43% markup.
* **Gutter Parts Estimator:** Custom fabrication pricing factoring in labor hours ($/hr), sheet material costs, workshop overhead %, and target profit margin.
* **Cloud & Local Persistence:** Real-time synchronization with Google Cloud Firestore database, coupled with offline browser `localStorage` caching.
* **Continuous Deployment (CI/CD):** Every commit pushed to GitHub `main` automatically triggers automated version incrementing, build timestamp generation, and immediate deployment to Firebase Hosting.
* **Automated Versioning:** Starts at `v1.01`, incrementing by `+0.01` with each commit (`v1.01` &rarr; `v1.99` &rarr; `v2.00`), embedding an immutable build timestamp for accurate tracking.
* **Print-Ready Quotes:** One-click formatted print preview designed for client export and physical printing.

---

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```
