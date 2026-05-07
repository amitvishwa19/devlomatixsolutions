"use server";
import { getSession } from "@/lib/auth";

async function useDevAuth() {
  try {
    const session = await getSession();
    if (!session || !session.data) {
      return {};
    }

    const user = session.data;
    return {
      user,
      userId: user.id,
      name: user.displayName || user.name,
      email: user.email,
      avatar: user.avatar || user.image,
    };
  } catch (error) {
    console.error("[USE_DEV_AUTH_ERROR]", error);
    return {};
  }
}

export default useDevAuth;