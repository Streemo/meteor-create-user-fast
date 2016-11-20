import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor"
import { check, Match } from "meteor/check";
import { SHA256 } from "meteor/sha";
import bcrypt from "bcrypt";

const bcryptHash = Meteor.wrapAsync(bcrypt.hash);

const getPasswordString = function (password) {
  if (typeof password === "string") {
    password = SHA256(password);
  } else { // 'password' is an object
    if (password.algorithm !== "sha-256") {
      throw new Error(
        "Invalid password hash algorithm. Only 'sha-256' is allowed."
      );
    }
    password = password.digest;
  }
  return password;
};

const hashPassword = function (password) {
  password = getPasswordString(password);
  return bcryptHash(password, Accounts._bcryptRounds);
};

Accounts.createUserFast = function(options){
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary
  // options.
  check(options, Match.ObjectIncluding({
    username: Match.Optional(String),
    email: Match.Optional(String),
    password: Match.Optional(Match.OneOf(
      String, {digest:String,algorithm:String}
    ))
  }));
  let username, email;
  if (options.username)
    username = options.username.toLowerCase();
  if (options.email)
    email = options.email.toLowerCase();
  if (!username && !email)
    throw new Meteor.Error(400, "Need to set a username or email");
  const user = {services: {}};
  if (options.password) {
    const hashed = hashPassword(options.password);
    user.services.password = { bcrypt: hashed };
  }
  if (username)
    user.username = username;
  if (email)
    user.emails = [{address: email, verified: false}];
  //got rid of all case-ins. checks
  //developer should feed value.toLowerCase() here.
  //An `alias` field can easily be implemented
  //by the developer if they care about case-sens
  //(e.g. {username:'somename',alias:"SoMeNaMe"})
  //all uniq./lookups should be done on username.
  return Accounts.insertUserDoc(options, user);
}