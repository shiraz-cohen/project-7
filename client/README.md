# 📸 Rush Hour – Camera and User Management System

Final project for Full Stack Development Bootcamp.  
This system enables an organization to manage users, grant access to security cameras, and view logs of unusual events. The app includes a user-friendly React-based frontend and a secure Node.js + Express backend connected to a MySQL database.

---

## 🧰 Technologies Used

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Other Tools:** Font Awesome

---

## 💡 What Can You Do with This System?

This platform is designed to simulate a basic security monitoring system for organizations. It offers the following features:

### 👥 User Roles

- **Admin**:

  - Full access to all parts of the system.
  - Can manage users and cameras.
  - Can view and manage logs of unusual events.
  - Responsible for assigning camera access to users.

- **Regular User**:
  - Can view only the cameras they are assigned to.
  - Can see unusual events related only to the cameras they have access to.
  - Cannot manage other users or system settings.

---

### 🔐 User Authentication

- Login form with validation.
- Authentication is handled on the backend.
- Tokens are stored using `localStorage`.
- Role-based routing – Admin and User see different pages.

---

### 👤 Admin Capabilities (CRUD)

#### User Management

- **Create:** Add new users with name, email, password, and role.
- **Read:** View a full list of registered users.
- **Update:** Edit user details or reset their passwords.
- **Delete:** Remove users from the system.

#### Camera Management

- **Create:** Add new security cameras.
- **Read:** View all cameras in the system.
- **Update:** Modify camera details (name, location, etc.).
- **Delete:** Remove cameras from the system.

#### Access Control

- Assign specific cameras to specific users.
- View which users have access to which cameras.

---

### 🎥 Unusual Event Logs

- Table view of unusual activities recorded from camera feeds.
- Events are associated with cameras and accessible based on user permissions.
- Video simulation available from the `video/` folder.
- Admin sees the full log; users see only relevant events.

---

### 🧭 Navigation and UX

- Clean navigation bar with role-based links.
- Font Awesome icons for clear UI cues.
- Mobile responsive design.

---

## ⚙️ Prerequisites

- Node.js (v18 or newer)
- MySQL
- Git

---

## 🚀 Installation & Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/shiraz-cohen/project-7.git
cd project-7
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Configure Environment Variables

In the `server/` folder, create a `.env` file with your database settings:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=rushhour
```

### 5. Set Up the MySQL Database

Run the `tables.sql` script to initialize your database:

```bash
mysql -u your_user -p < tables.sql
```

### 6. Start the Server

```bash
cd server
npm start
```

Server runs at: [http://localhost:3000](http://localhost:3000)

### 7. Start the Client

In a separate terminal:

```bash
cd client
npm run dev
```

Frontend runs at: [http://localhost:5173](http://localhost:5173)

---
