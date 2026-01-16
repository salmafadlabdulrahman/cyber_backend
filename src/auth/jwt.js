//The purpose of this file:
//To check if the user is allowed or authorized to see the route they're visting
//To protect files from unauthorized users

const { expressjwt: expressJwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.SECRET_KEY;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/products(\/.*)?/, method: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(\/.*)?/, method: ["GET", "OPTIONS"] },
      "/api/v1/auth/login",
      "/api/v1/auth/signup",
    ],
  });
}

/*The is Revoked is a function that takes 2 parameters. 
the request we're sending and the token of the current user
if the payload which is the info inside the token. if it's not for the admin. then deny their access */
async function isRevoked(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }
  return false;
}

module.exports = authJwt;
