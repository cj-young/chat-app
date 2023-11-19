"use server";

interface NameInfo {
  displayName: string;
  username: string;
}

export async function createName({ displayName, username }: NameInfo) {
  return { error: "Placeholder" };
}
