import type { NextConfig } from "next";

// Configuration CORS
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://localhost:64940",
	"http://127.0.0.1:64940",
	"http://192.168.1.156:3000",
	"http://192.168.1.156:3001",
];

const nextConfig: NextConfig = {
	// Désactiver la vérification de type au moment de la construction
	typescript: {
		ignoreBuildErrors: true,
	},

	// Désactiver la vérification ESLint pendant la construction
	eslint: {
		ignoreDuringBuilds: true,
	},

	// Configuration des en-têtes CORS
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
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

	// Configuration pour les requêtes de développement
	experimental: {
		serverActions: {
			allowedOrigins: [
				"localhost:3000",
				"localhost:3001",
				"127.0.0.1:3000",
				"127.0.0.1:3001",
				"192.168.1.156:3000",
				"192.168.1.156:3001",
			],
		},
	},
};

export default nextConfig;
