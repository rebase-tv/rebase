import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./dynamo";
import { ulid } from "ulid";
export * as User from "./user";

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
      avatar: {
        type: "string",
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
    },
  },
  Dynamo.Service
);

export type Info = EntityItem<typeof UserEntity>;

export async function fromEmail(email: string) {
  const result = await UserEntity.query
    .byEmail({
      email,
    })
    .go();
  if (!result.data.length) return null;
  return result.data[0];
}

export async function create(input: {
  email: string;
  avatar: string;
  name?: string;
  username: string;
}) {
  const result = await UserEntity.create({
    userID: ulid(),
    ...input,
  }).go();
  return result.data;
}

export async function fromID(id: string) {
  const result = await UserEntity.get({
    userID: id,
  }).go();
  return result.data;
}
