import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				// Appliquer ces en-têtes à toutes les routes
				source: "/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value:
							"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
					},
				],
			},
		];
	},
	async rewrites() {
		return {
			beforeFiles: [
				// Réécrire les requêtes API vers le serveur backend
				{
					source: "/api/:path*",
					destination: "http://localhost:3000/api/:path*",
				},
				// Réécrire les requêtes tRPC vers le serveur backend
				{
					source: "/trpc/:path*",
					destination: "http://localhost:3000/trpc/:path*",
				},
			],
		};
	},
	// Désactiver la vérification de type au moment de la construction
	typescript: {
		ignoreBuildErrors: true,
	},
	// Désactiver la vérification ESLint pendant la construction
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
