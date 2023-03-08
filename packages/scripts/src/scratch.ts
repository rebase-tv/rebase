import { User } from "@rebase/core/user"
import {
  filter,
  groupBy,
  map,
  mapKeys,
  mapValues,
  pipe,
  sortBy,
  uniq,
  uniqBy,
  values,
} from "remeda"
import { decodeTime } from "ulid"

const all = new Map<string, User.Info>()
for await (const user of User.list()) {
  all.set(user.userID, user)
}

console.log("Total user count", all.size)

console.log(
  pipe(
    [...all.values()],
    groupBy((user) => {
      const created = new Date(decodeTime(user.userID))
      created.setHours(0)
      created.setMinutes(0)
      created.setSeconds(0)
      created.setMilliseconds(0)
      return created.toISOString()
    }),
    mapValues((group) => group.length),
    Object.entries,
    sortBy(([key]) => key)
  )
)
