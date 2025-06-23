import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink, loggerLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/trpc/router/_app";

// Configuration des liens tRPC
const createTRPCLinks = () => {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

	return [
		loggerLink({
			enabled: (opts) =>
				process.env.NODE_ENV === "development" ||
				(opts.direction === "down" && opts.result instanceof Error),
		}),
		httpBatchLink({
			url: `${baseUrl}/trpc`,
			async fetch(url, options) {
				try {
					const response = await fetch(url, {
						...options,
						credentials: "include",
						headers: {
							...options?.headers,
							"Content-Type": "application/json",
						},
					});

					// Vérifier si la réponse est une erreur CORS
					if (response.status === 0) {
						throw new Error(
							"Erreur de connexion au serveur. Vérifiez votre connexion réseau.",
						);
					}

					// Vérifier si la réponse est une erreur 403 (Forbidden)
					if (response.status === 403) {
						const error = await response.json().catch(() => ({}));
						throw new Error(
							error.message ||
								"Accès refusé. Vous n'avez pas les droits nécessaires.",
						);
					}

					return response;
				} catch (error) {
					console.error("Erreur de requête tRPC:", error);
					throw error;
				}
			},
		}),
	];
};

// Configuration du client tRPC
export const trpc = createTRPCReact<AppRouter, "">({
	config() {
		return {
			links: createTRPCLinks(),
			queryClientConfig: {
				defaultOptions: {
					queries: {
						retry: 1,
						refetchOnWindowFocus: false,
						staleTime: 5 * 60 * 1000, // 5 minutes
					},
				},
			},
		};
	},
	overrides: {
		useMutation: {
			async onSuccess(opts) {
				try {
					await opts.originalFn();
					await opts.queryClient.invalidateQueries();
				} catch (error) {
					console.error("Erreur dans useMutation:", error);
					throw error;
				}
			},
		},
	},
});

// Configuration du client React Query
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	},
});
