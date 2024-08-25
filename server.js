require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const attachUserName = require('./middleware/attachUsername'); // Import the middleware

const app = express();
const port = process.env.PORT || 5000;

// Initialize multer middleware
const upload = multer();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(upload.single('driverPhoto'));

// Initialize session middleware with enhanced configuration
app.use(session({
    secret: '4a77566ded4b7a481c8fbf0c58b552cb1a15c24f45d32f5fced2ae580d9c311cf2fa5159b31b38bb699433b1bdc9823fdd5864860823bba9cc0d0a8a81b72570', // Replace with a secure key
    resave: false,             // Do not save session if unmodified
    saveUninitialized: false,  // Do not create a session until something is stored
    cookie: {
        secure: false,         // Should be true if HTTPS is used
        maxAge: 30 * 60 * 1000 // Session expiration time in milliseconds (30 minutes)
    }
}));

// Use the attachUserName middleware after session middleware
app.use(attachUserName);

// Import and use route files
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const vehicleRoutes = require('./routes/VehicleRoutes');
const vehicleMaintenanceRoutes = require('./routes/VehicleMaintenanceRoutes');
const transportRequestRoutes = require('./routes/transportRequestRoutes');
const pickAndDropServiceRoutes = require('./routes/PickAndDropServiceRoutes');
const contractualServiceRoutes = require('./routes/contractualServiceRoutes');
const vehicleReportRoutes = require('./routes/VehicleReportRoutes');
const driverRoutes = require('./routes/DriverRoutes');
const logsRoutes = require('./routes/logsRoutes');
const driverPageRoutes = require('./routes/DriverPageRoutes');
const vehicleMaintenanceDueRoutes = require('./routes/VehicleMaintenanceDueRoutes');
const vehicleManagementRoutes = require('./routes/VehicleManagementRoutes');
const authRoutes = require('./routes/authRoutes'); // Add sign-in route
const trackingRoutes = require('./routes/trackingRoutes');
const vehicleMovementRoutes = require('./routes/vehicleMovementRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requestRoutes = require('./routes/requestRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-maintenance', vehicleMaintenanceRoutes);
app.use('/api/transport-requests', transportRequestRoutes);
app.use('/api/pick-drop-service', pickAndDropServiceRoutes);
app.use('/api/contractual-service', contractualServiceRoutes);
app.use('/api/vehicle-reports', vehicleReportRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/driver-reports', driverPageRoutes);
app.use('/api/vehicle-maintenance-due', vehicleMaintenanceDueRoutes);
app.use('/api/vehicle-management', vehicleManagementRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/vehicle-movement', vehicleMovementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
