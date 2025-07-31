# 🚀 En La Parada — Transforming Public Transport in Venezuela

**En La Parada** is a revolutionary mobile application designed to improve public transportation in Venezuela. It addresses two major challenges: the difficulty of paying fares in cash and the complexity of navigating informal transport routes. Built with **React Native (Expo)** on the frontend and **Node.js + Express** on the backend, this all-in-one solution enhances urban mobility and ensures a smoother experience for passengers and drivers alike.

---

## 🌟 How It Works

### 💳 Digital Payments Made Easy

Say goodbye to cash. Passengers can create a virtual wallet, deposit funds, and pay fares by scanning a QR code on the transport vehicle. The amount is instantly transferred to the driver's wallet, making the process **fast**, **secure**, and **frictionless**.

### 🗺️ Intelligent Route Navigation

No more getting lost. En La Parada allows users to search and view public transport (minibus/camioneta) routes on a live map. Just enter your **origin and destination**, and the app shows the **nearest and most convenient route**.

---

## 🛠️ Technologies & Features

En La Parada is built with a robust and modern stack to ensure a **secure**, **scalable**, and **intuitive** experience.

---

### 🧠 Backend — Node.js with Express

The backend powers the core operations, including payments, route logic, authentication, and data management. We use **Supabase** as our PostgreSQL database provider.

#### Key Libraries & Features:

- **💳 Stripe** — Secure and efficient processing of passenger deposits.
- **🔒 Bcrypt** — Robust password hashing to ensure user security.
- **🔑 JSON Web Token (jsonwebtoken)** — Authenticates and protects access to private endpoints.
- **⬆️ Multer** — Handles image uploads (e.g., user profile photos).
- **📧 Nodemailer** — Sends verification emails to ensure account legitimacy.
- **✅ Zod** — Validates and sanitizes data from users and external APIs.
- **🔗 CORS** — Manages cross-origin security policies.
- **📦 node-postgres (pg)** — Database client for PostgreSQL via Supabase.

---

### 📱 Frontend — React Native with Expo

The mobile interface delivers a smooth and native experience on Android and iOS using the Expo SDK.

#### Key Modules & Capabilities:

- **🗺️ Mapping & Routing**:

  - `react-native-maps`
  - `expo-location`
  - `react-native-google-places-autocomplete`

- **📸 QR Code Payments**:

  - `expo-camera`
  - `react-native-qrcode-svg`

- **💾 State Management**:

  - `zustand` — Lightweight, scalable state store.

- **📡 API Communication**:

  - `axios` — Efficient HTTP client for talking to the backend.

- **🖼️ Media Handling**:

  - `expo-image-picker` and `expo-image`

- **🔐 Secure Storage**:

  - `expo-secure-store` — Stores session tokens and user credentials securely.

- **📊 Navigation**:

  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`

- **🎨 UI Icons**:

  - `@expo/vector-icons`
  - `expo-symbols`

- **💳 Stripe Payments**:
  - `@stripe/stripe-react-native` — Native Stripe integration for mobile payments.

---

## 📸 Screenshots

| Passenger Home Screen         | Driver QR Code                 | Route Map View                |
| ----------------------------- | ------------------------------ | ----------------------------- |
| ![home](./images/QRcode.jpeg) | ![qr](./images/Passenger.jpeg) | ![map](./images//Routes.jpeg) |

---

## Set your environment variables in a `.env` file:

GOOGLE_MAPS_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

### Frontend Setup

1. Navigate to `/frontend`
2. Run `npm install`
3. Start the Expo dev server:

---

## 📬 Contact

Built with ❤️ for the people of Venezuela.

For collaboration or technical questions, contact [jeangutierrez18@example.com].

---
