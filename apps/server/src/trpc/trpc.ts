import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "@/lib/context";

const t = initTRPC.context<Context>().create();

export const createRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.session || !ctx.session.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			...ctx,
			session: { ...ctx.session, user: ctx.session.user },
		},
	});
});
