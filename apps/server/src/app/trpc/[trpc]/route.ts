import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createContext } from "@/lib/context";
import { appRouter } from "@/trpc/router/_app";

type CORSHeaders = {
	[key: string]: string;
};

// Configuration CORS pour le développement
const corsHeaders: CORSHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handler(req: NextRequest) {
	// Gestion des requêtes OPTIONS pour le prévol CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: corsHeaders,
		});
	}

	// Création d'une réponse de base avec les en-têtes CORS
	const createResponse = (
		body: BodyInit | null,
		status = 200,
		headers: CORSHeaders = {},
	) => {
		return new Response(body, {
			status,
			headers: {
				...corsHeaders,
				...headers,
			},
		});
	};

	try {
		const response = await fetchRequestHandler({
			endpoint: "/trpc",
			req,
			router: appRouter,
			createContext: () => createContext(req),
			responseMeta({ type, errors }) {
				// Vérifie qu'il n'y a pas d'erreur et que c'est une requête de requête
				const allOk = errors.length === 0;
				const isQuery = type === "query";

				// Si c'est une requête et qu'il n'y a pas d'erreur, on peut mettre en cache
				if (allOk && isQuery) {
					// Mise en cache pour 1 jour
					const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
					return {
						headers: {
							"cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
							...corsHeaders,
						},
					};
				}

				// Sinon, on retourne juste les en-têtes CORS
				return { headers: corsHeaders };
			},
		});

		// Ajout des en-têtes CORS à la réponse
		const responseHeaders = new Headers(response.headers);
		Object.entries(corsHeaders).forEach(([key, value]) => {
			responseHeaders.set(key, value);
		});

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error("tRPC error:", error);
		return createResponse(
			JSON.stringify({ error: "Internal server error" }),
			500,
			{ "Content-Type": "application/json" },
		);
	}
}

export { handler as GET, handler as POST, handler as OPTIONS };
