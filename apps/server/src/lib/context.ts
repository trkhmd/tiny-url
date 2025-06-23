import type { NextRequest } from "next/server";
import prisma from "../../prisma";
import { auth } from "./auth";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return {
		session,
		prisma,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
