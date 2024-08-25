const axios = require('axios');

// Replace these with your actual login credentials
const loginCredentials = {
    login: 'nawab',
    password: '123' // Use the plain password for now
};

const getToken = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/signin', loginCredentials);
        const token = response.data.token;
        console.log('Your token:', token);
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
    }
};

getToken();
