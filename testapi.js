// testapi.js
const axios = require('axios');

// Replace 'YOUR_TOKEN_HERE' with your actual token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJuYXdhYiIsImlhdCI6MTcyMTgxMzgzMCwiZXhwIjoxNzIxODE3NDMwfQ.RVCu_p6i1vyXGjpOd5TnkU1u_drCaW6HMFUjGsHSSlA';

const fetchTrackingRecords = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/tracking', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Tracking Records:', response.data);
    } catch (error) {
        console.error('Error fetching tracking records:', error.response ? error.response.data : error.message);
    }
};

fetchTrackingRecords();
