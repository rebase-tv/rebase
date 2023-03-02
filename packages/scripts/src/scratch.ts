import { User } from "@rebase/core/user"
import {
  filter,
  groupBy,
  map,
  mapKeys,
  mapValues,
  pipe,
  uniq,
  uniqBy,
  values,
} from "remeda"

const all = new Map<string, User.Info>()
for await (const user of User.list()) {
  all.set(user.userID, user)
}

console.log("Total user count", all.size)
const arr = [...all.values()]

console.log(
  "Referrals",
  pipe(
    arr,
    filter((user) => user.ref !== undefined),
    groupBy((user) => user.ref!),
    mapKeys((key) => {
      const u = all.get(key.toString())
      return u?.name || u?.email || "unknown"
    }),
    mapValues((list) => list.length)
  )
)