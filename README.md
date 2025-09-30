# Hospital Form Website

A comprehensive hospital form management system with separate interfaces for doctors and patients, built with React.js and Firebase.

## Features

### Patient Side
- **Patient Registration Form**: Comprehensive form with personal, contact, and medical information
- **Unique Patient ID Generation**: Automatic 9-digit ID generation upon form submission
- **Email & SMS Notifications**: Confirmation messages sent to patient's email and phone
- **Form Validation**: Client-side validation with error handling
- **Responsive Design**: Mobile-friendly interface

### Doctor Side (Admin)
- **Secure Authentication**: Firebase-based login system for healthcare professionals
- **Patient Search**: Search by Patient ID, email, phone number, or name
- **Patient Record Management**: View and edit patient information
- **Patient List**: Paginated list of all patients with quick access
- **Real-time Updates**: Changes are immediately reflected in the database

## Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Update `src/config/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2. Firebase Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Create a doctor account for testing:
   - Email: `doctor@demo.com`
   - Password: `demo123`

### 3. Firestore Database Setup

1. Create a Firestore database in production mode
2. Set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users (doctors) to read and write patient data
    match /patients/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx          # Main landing page with login options
│   ├── DoctorLogin.jsx          # Doctor authentication form
│   ├── PatientForm.jsx          # Patient registration form
│   ├── ConfirmationPage.jsx     # Form submission confirmation
│   └── DoctorDashboard.jsx      # Doctor's patient management interface
├── config/
│   └── firebase.js              # Firebase configuration
├── utils/
│   ├── patientId.js             # Patient ID generation utilities
│   └── notifications.js         # Email/SMS notification services
├── App.jsx                      # Main app component with routing
├── index.css                    # Tailwind CSS styles
└── main.jsx                     # App entry point
```

## Usage Flow

### For Patients:
1. Visit the landing page
2. Click "Submit Patient Form"
3. Fill out the comprehensive medical form
4. Submit the form to receive a unique 9-digit Patient ID
5. Check email and SMS for confirmation

### For Doctors:
1. Visit the landing page
2. Click "Doctor Login"
3. Sign in with credentials
4. Use the dashboard to:
   - Search for patients by ID, email, phone, or name
   - View patient records
   - Edit patient information
   - Browse all patients with pagination

## Key Features Explained

### Patient ID Generation
- Generates unique 9-digit IDs using timestamp and random numbers
- IDs are validated for format consistency
- Used as primary identifier for patient lookup

### Search Functionality
- Multiple search criteria supported
- Real-time search with Firestore queries
- Handles partial matches for names
- Exact matches for ID, email, and phone

### Form Validation
- Client-side validation for all required fields
- Email format validation
- Phone number format checking
- Age range validation (1-150)

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Accessible form controls
- Professional medical theme

## Customization

### Styling
- Modify `tailwind.config.js` for custom colors and themes
- Update `src/index.css` for global styles
- Component-specific styles are in individual files

### Notifications
- Update `src/utils/notifications.js` to integrate with:
  - SendGrid for email notifications
  - Twilio for SMS notifications
  - Firebase Functions for serverless execution

### Database Schema
The patient document structure in Firestore:

```javascript
{
  patientId: "123456789",
  name: "John Doe",
  age: 30,
  gender: "male",
  address: "123 Main St, City, State",
  email: "john@example.com",
  phoneNumber: "+1234567890",
  medicalHistory: "Optional medical history text",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Security Considerations

- Firebase Authentication ensures only authorized doctors can access patient data
- Firestore security rules prevent unauthorized access
- Patient data is encrypted in transit and at rest
- No sensitive data is stored in client-side code

## Future Enhancements

- Integration with external email/SMS services
- Advanced search with fuzzy matching
- Patient photo uploads
- Medical document attachments
- Appointment scheduling
- Multi-language support
- Audit logs for data changes
- Export functionality for patient records

## Support

For technical support or questions about this system, please contact the development team or refer to the Firebase documentation for backend-related issues.