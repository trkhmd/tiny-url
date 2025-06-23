import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Liste des origines autorisées
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:64940",
	"http://localhost:64940",
	"http://192.168.1.156:3000",
	"http://192.168.1.156:3001",
];

// Fonction pour vérifier si l'origine est autorisée
const isOriginAllowed = (origin: string | null): boolean => {
	if (!origin) return false;
	return allowedOrigins.some(
		(allowedOrigin) =>
			origin === allowedOrigin ||
			origin.startsWith(allowedOrigin.replace(/^https?:\/\//, "http://")),
	);
};

export async function middleware(request: NextRequest) {
	// Récupérer l'origine de la requête
	const origin = request.headers.get("origin") || "";
	const isAllowedOrigin = isOriginAllowed(origin);

	// Créer une réponse de base
	const response = NextResponse.next();

	// Définir les en-têtes CORS
	if (isAllowedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
	}

	response.headers.set(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS",
	);
	response.headers.set(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
	);
	response.headers.set("Access-Control-Expose-Headers", "*");
	response.headers.set("Access-Control-Max-Age", "86400"); // 24 heures

	// Répondre immédiatement aux requêtes OPTIONS (prévol)
	if (request.method === "OPTIONS") {
		return new NextResponse(null, {
			status: 204,
			headers: Object.fromEntries(response.headers),
		});
	}

	// Pour les requêtes API, ajouter des en-têtes de sécurité supplémentaires
	if (
		request.nextUrl.pathname.startsWith("/api/") ||
		request.nextUrl.pathname.startsWith("/trpc/")
	) {
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-XSS-Protection", "1; mode=block");

		// Bloquer les requêtes non autorisées
		if (origin && !isAllowedOrigin) {
			return new NextResponse(
				JSON.stringify({ error: "Not allowed by CORS" }),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
						...Object.fromEntries(response.headers),
					},
				},
			);
		}
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
