import { createRouter } from "@/trpc/trpc";
import { linkRouter } from "./link";

export const appRouter = createRouter({
	link: linkRouter,
});

export type AppRouter = typeof appRouter;
