const attachUserName = (req, res, next) => {
    // Logging the session object to debug
    console.log('Session object before checking:', req.session);
    
    // Check if session exists and has a userName
    if (req.session && req.session.userName) {
        req.userName = req.session.userName;
        console.log(`UserName "${req.userName}" attached from session`);
    } else {
        // If userName is not found in session, it sets to 'Unknown User'
        req.userName = 'Unknown User';
        console.log('UserName set to "Unknown User"');
    }
    
    // Continue to the next middleware or route handler
    next();
};

module.exports = attachUserName;
