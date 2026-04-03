# Facility Flow | Smart Campus Operations Hub

Facility Flow is a premium Authentication & Authorization module (Module E) designed for a university Smart Campus ecosystem. It provides a secure, role-based infrastructure for students, staff, and administrators.

---

## 🚀 Tech Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.4 (Java 17)
- **Security**: Spring Security (OAuth2 Client + JWT)
- **Auth Strategy**: Google OAuth 2.0 with custom `prompt=select_account` integration.
- **Database**: MongoDB (NoSQL) for scalable campus records.
- **Token**: Stateless JSON Web Tokens (JWT) for secure API authorization.
- **Utilities**: Lombok, Jakarta Annotations, JJWT.

### Frontend (React)
- **Framework**: React 18
- **Navigation**: React Router 6 (with Protected Role-Based Routing)
- **Styling**: Vanilla CSS with a **Royal Blue (#4169E1)** theme.
- **Icons**: Lucide React for a crisp, modern UI.
- **State Management**: React Context API for global Authentication and User Role state.
- **API Client**: Axios with interceptors for automatic JWT attachment.

---

## 🛠️ Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MongoDB** (Local or Cloud instance)
- **Google Cloud Console Project** (for OAuth2 credentials)

---

## ⚙️ Google OAuth2 Configuration
To enable Google Login:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. Set the **Authorized Redirect URI** to:
   `http://localhost:8092/login/oauth2/code/google`
4. Copy your **Client ID** and **Client Secret**.

---

## 🏃 How to Run

### 1. Backend Setup
1. Create your local configuration file:
   ```powershell
   cd backend/src/main/resources
   cp application.yml.example application.yml
   ```
2. Open **`application.yml`** and fill in your real credentials:
   - **MongoDB URI**: Your connection string (with username/password).
   - **Google OAuth**: Your Client ID and Secret.
   - **JWT Secret**: Any secure, random string.

> [!IMPORTANT]
> **Security First**: The `application.yml` file is already added to `.gitignore`. Your real secrets will **never** be committed to your repository. Only `application.yml.example` is shared.

3. Run the backend:
   ```powershell
   cd backend
   ./mvnw spring-boot:run
   ```
   *Server starts on port **8092**.*

### 2. Frontend Setup
1. Install dependencies:
   ```powershell
   cd frontend
   npm install
   ```
2. Check your [src/config.js](file:///c:/Users/kevin/Downloads/Facility-Flow/frontend/src/config.js) to ensure it points to port `8092`.
3. Start the application:
   ```powershell
   npm start
   ```
   *Dashboard launches on port **3000**.*

---

## 💡 Role-Based Features
- **USER**: Access to personal **Dashboard**, **Facility Bookings**, and **Campus Maps**.
- **TECHNICIAN**: Access to the **Technician Console**, **Pending Tasks**, and **Maintenance Logs**.
- **ADMIN**: Full access to **User Management**, **Role Assignments**, and **Security Logs**.

*Project developed for University Smart Campus Operations Hub.*
