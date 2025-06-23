"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type React from "react";
import { useState } from "react";
import superjson from "superjson";

import type { AppRouter } from "../../../server/src/trpc/router/_app";
import { trpc } from "./trpc";

const getBaseUrl = () => {
	// En développement, on utilise l'URL complète du serveur backend
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}
	// En production, on utilise l'URL de base du site
	if (typeof window !== "undefined") return ""; // Le navigateur utilisera l'URL relative
	// Pour le SSR, on utilise l'URL de déploiement Vercel
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	// Fallback pour le développement SSR
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default function TRPCProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				loggerLink({
					enabled: (opts) =>
						process.env.NODE_ENV === "development" ||
						(opts.direction === "down" && opts.result instanceof Error),
				}),
				httpBatchLink({
					url: `${getBaseUrl()}/trpc`,
					headers() {
						// On peut ajouter des en-têtes personnalisés ici si nécessaire
						const headers: Record<string, string> = {
							"Content-Type": "application/json",
						};

						// Si on a un token d'authentification, on l'ajoute
						// const token = getAuthCookie();
						// if (token) {
						//   headers['Authorization'] = `Bearer ${token}`;
						// }

						return headers;
					},
					fetch: (url, options) => {
						return fetch(url, {
							...options,
							credentials: "include", // Important pour les cookies
							headers: {
								...options?.headers,
								"Content-Type": "application/json",
							},
						});
					},
				}),
			],
			transformer: superjson,
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
