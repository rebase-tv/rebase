import { Entity, EntityItem } from "electrodb"
import { Dynamo } from "./dynamo"
import { ulid } from "ulid"
export * as User from "./user"

const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "rebase",
    },
    attributes: {
      userID: {
        type: "string",
        required: true,
      },
      email: {
        type: "string",
        required: true,
      },
      username: {
        type: "string",
        required: true,
      },
      ref: {
        type: "string",
      },
      avatar: {
        type: "string",
        required: true,
      },
      index: {
        type: "number",
        required: true,
      },
      name: {
        type: "string",
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byEmail: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["email"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
      byRef: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["ref"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["userID"],
        },
      },
    },
  },
  Dynamo.Service
)

const UserIncrement = new Entity(
  {
    model: {
      entity: "user_increment",
      version: "1",
      service: "rebase",
    },
    attributes: {
      value: {
        type: "number",
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: [],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service
)

export type Info = EntityItem<typeof UserEntity>

export async function fromEmail(email: string) {
  const result = await UserEntity.query
    .byEmail({
      email,
    })
    .go()
  if (!result.data.length) return null
  return result.data[0]
}

export async function create(input: {
  email: string
  avatar: string
  name?: string
  username: string
  ref?: string
}): Promise<Info> {
  const last = (await UserIncrement.get({}).go())?.data?.value
  const next = (last ?? 0) + 1
  const id = ulid()
  try {
    await UserEntity.client
      .transactWrite({
        TransactItems: [
          {
            Put: UserEntity.create({
              userID: id,
              index: next,
              ref: input.ref,
              ...input,
            }).params(),
          },
          {
            Update: UserIncrement.update({})
              .set({ value: next })
              .where((attr, op) => {
                if (last) return op.eq(attr.value, last)
                return op.notExists(attr.value)
              })
              .params({
                response: "all_new",
              }),
          },
        ],
      })
      .promise()
  } catch {
    return create(input)
  }
  return fromID(id).then((u) => u!)
}

export async function fromID(id: string) {
  const result = await UserEntity.get({
    userID: id,
  }).go()
  return result.data
}

export async function referrals(id: string) {
  const result = await UserEntity.query
    .byRef({
      ref: id,
    })
    .go()
  return result.data
}

export async function* list() {
  let cursor: string = null as any
  while (true) {
    const result = await UserEntity.scan.go({
      cursor: cursor,
    })
    yield* result.data
    if (!cursor) break
    cursor = result.cursor as any
  }
}
