const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Check if the token is missing
    if (token == null) {
        return res.status(401).json({ message: "Unauthorized" }); // Send 401 Unauthorized response
    }

    // Verify the token
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: invalid token" }); // Send 403 Forbidden response
        }

        // Attach user to the request object and proceed
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;