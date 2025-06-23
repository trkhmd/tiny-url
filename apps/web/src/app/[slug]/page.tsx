"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export const dynamic = "force-dynamic";

export default function RedirectPage({ params }: { params: { slug: string } }) {
	const { slug } = params;
	const { data: result, error } = trpc.link.getBySlug.useQuery({ slug });

	useEffect(() => {
		if (error) {
			console.error("Redirect error:", error);
			window.location.href = "/?error=An error occurred";
		} else if (result === null) {
			window.location.href = "/?error=Link not found";
		} else if (result?.url) {
			window.location.href = result.url;
		}
	}, [result, error]);

	// Afficher un message de chargement pendant la redirection
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 font-bold text-2xl">Redirection en cours...</h1>
				<p>Veuillez patienter pendant que nous vous redirigeons.</p>
			</div>
		</div>
	);
}
