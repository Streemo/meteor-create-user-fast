# create-user-fast

### Why
With vanilla `Accounts.createUser`, insert time increases quickly as N increases. With 20k users, my MBP took about a second to add a new user. Bcrypt is the massive bottleneck up until we reach a few thousand users (you should always expect a physical upper-bound of ~10 inserts/sec due to the 10 bcrypt rounds). 

Since the inserts were taking well over 100ms, the dominating bottleneck term became something else. That something else turned out to be this `checkForCaseInsensitiveDuplicates` ([source](https://github.com/meteor/meteor/blob/master/packages/accounts-password/password_server.js#L190)). Trying to generalize the solution of case-insensitivity is silly, and it should ultimately be up to the developer, since every developer has different requirements. The general solution implemented by MDG isn't scalable. 

### Results
`Accounts.createUserFast` will maintain 10 inserts/sec (the upper-bound) even with tens of thousands of users in the database already. This is because we are not doing a case insensitive scan/search on the `username` and `emails.address` for every insert, since these values are guaranteed to be normalized, thus guaranteed to be unique (due to our default unique indexes on these fields). Since we have MongoDB's atomicity on a per document basis, we don't even need to check of someone else has inserted the same document in the meantime.

##To MDG
I highly urge you guys to get rid of this function `checkForCaseInsensitiveDuplicates` everywhere, and not try to solve a complex problem in the general case. When you have to do things like `try/catch` to make sure "nothing else has been inserted in the mean-time" in mongodb, it may mean you've designed your collection incorrectly. The better mongodb design is to store the case sensitive value in a separate field manually, index the normalized fields (which guarantee uniqueness, and atomic insert), and perform accounts functionality on the normalized fields. The separate field is used for client display only. To other users: it's not very difficult to implement this. If you want better performance in the long run, I suggest manually handling case-sensitivity in `username` and `emails.address`. 

### Readme!
Server Only. `Accounts.createUserFast` is like `Accounts.createUser`, but it skips all of the case insensitivity checks. The API is the exact same. Underneath, `Accounts.createUserFast` will `toLowerCase()` any email/username value you send in, so you would have to store the original in a new field of your choosing, if you care about case sensitivity. For example, I would store the original username: "MyUsErNaMe100" in the `alias` field, since `Accounts.createUserFast` will automatically normalize the `username` field to `myusername100`.

```
import { Accounts } from "accounts-base";

//store case-sensitive value manually.
const alias = username;

const userId = Accounts.createUserFast(
  {username, email, password, alias}
)

////  or add the alias later.
//
//  Meteor.users.update(userId, 
//    {$set:{alias}}
//   )
//
////
```