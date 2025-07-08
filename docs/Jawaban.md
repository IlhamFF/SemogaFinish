# PROJECT PROGRESS

## Authentication Module

### Requirements Fungsi Autentifikasi

Based on the project files and the identified user roles (admin, pimpinan, guru, siswa), the authentication module needs to fulfill the following requirements:

-   **Secure User Registration:** Allow new users to register with necessary information (username, password, role - potentially assigned by an admin for certain roles). Password should be securely hashed and stored.
-   **User Login:** Provide a mechanism for registered users to log in using their credentials. Upon successful login, the system should issue a secure token (e.g., JWT) for subsequent requests.
-   **Role-Based Access Control (RBAC):** Implement a system where access to certain routes, data, and functionalities is restricted based on the user's assigned role.
    -   **Admin:** Full access to all administrative functionalities, including user management (creation, modification, deletion, role assignment), system settings, and potentially viewing all data.
    -   **Pimpinan:** Access to oversight functionalities, including reports (e.g., academic reports, class details), and potentially viewing aggregated data. Read-only access to most administrative data.
    -   **Guru:** Access to functionalities related to teaching and managing their classes, including managing bank soal, creating tests and assignments, recording attendance, inputting grades, and managing teaching materials (materi ajar, RPP, Silabus).
    -   **Siswa:** Access to functionalities related to their learning, including viewing their schedule, accessing learning materials, taking tests, submitting assignments, and viewing their grades and reports (rapor).
-   **Password Reset:** Provide a secure method for users to reset their forgotten passwords, likely involving email verification.
-   **Email Verification:** Implement email verification for new user registrations to ensure the validity of the provided email address.
-   **Token Management:** Securely issue, validate, and revoke authentication tokens. Tokens should have an expiration time.
-   **Authentication Middleware:** Implement middleware to protect routes and endpoints, verifying the authenticity and authorization of incoming requests.
-   **User Profile Management:** Allow users to view and potentially update their own profile information (excluding sensitive fields like role and password).

### Table Autentifikasi

A database table named `users` will be used to store user information for authentication and authorization. Based on the existing `src/entities/user.entity.ts` file and the requirements, the table schema will be as follows:

| Field Name        | Data Type    | Constraints                     | Description                               |
|-------------------|--------------|---------------------------------|-------------------------------------------|
| `id`              | UUID/INT     | PRIMARY KEY, UNIQUE             | Unique identifier for the user            |
| `username`        | VARCHAR      | UNIQUE, NOT NULL                | User's unique username                    |
| `email`           | VARCHAR      | UNIQUE, NOT NULL                | User's email address                      |
| `password_hash`   | VARCHAR      | NOT NULL                        | Hashed password of the user               |
| `role`            | ENUM         | NOT NULL, ('admin', 'pimpinan', 'guru', 'siswa') | User's role in the system               |
| `first_name`      | VARCHAR      | NULLABLE                        | User's first name                         |
| `last_name`       | VARCHAR      | NULLABLE                        | User's last name                          |
| `created_at`      | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp of user creation              |
| `updated_at`      | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Timestamp of last update      |
| `is_verified`     | BOOLEAN      | NOT NULL, DEFAULT FALSE         | Indicates if the email is verified        |
| `reset_password_token` | VARCHAR | NULLABLE                        | Token for password reset                |
| `reset_password_expires` | TIMESTAMP | NULLABLE                      | Expiration time for password reset token |

### Desain Class Diagram Autentifikasi


