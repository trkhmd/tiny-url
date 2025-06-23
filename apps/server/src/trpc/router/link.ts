import { customAlphabet } from "nanoid";
import { z } from "zod";
import { createRouter, protectedProcedure, publicProcedure } from "@/trpc/trpc";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export const linkRouter = createRouter({
	create: publicProcedure
		.input(
			z.object({
				url: z.string().url({ message: "Veuillez entrer une URL valide." }),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { prisma } = ctx;
			const { url } = input;

			const slug = nanoid();

			const link = await prisma.link.create({
				data: {
					url,
					shortUrl: slug,
					// userId is now optional since the procedure is public
				},
			});

			return link;
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { prisma } = ctx;
			const { slug } = input;

			const link = await prisma.link.findUnique({
				where: {
					shortUrl: slug,
				},
			});

			if (link) {
				await prisma.link.update({
					where: {
						id: link.id,
					},
					data: {
						clicks: {
							increment: 1,
						},
					},
				});
			}

			return link;
		}),
});
