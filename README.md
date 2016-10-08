# create-user-fast

Server Only. `Accounts.createUserFast` is like `Accounts.createUser`, but it skips all of the case insensitivity checks. `Accounts.createUserFast` will `toLowerCase()` any email/username value you send in, so you will have to store the original in a new field of your choosing. For example, I would store the original username: "MyUsErNaMe100" in the `alias` field, since `Accounts.createUserFast` will automatically normalize the `username` field to `myusername100`. You don't need to use an alias field if you don't care about case sensitivity.

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