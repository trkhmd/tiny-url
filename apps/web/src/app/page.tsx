"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

// Schéma de validation avec Zod
const formSchema = z.object({
	url: z.string().url({ message: "Veuillez entrer une URL valide." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
	const [shortUrl, setShortUrl] = useState("");

	const createLinkMutation = trpc.link.create.useMutation({
		onSuccess: (data) => {
			setShortUrl(`${window.location.origin}/${data.shortUrl}`);
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: "",
		},
	});

	const onSubmit = (data: FormValues) => {
		createLinkMutation.mutate(data);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(shortUrl);
		toast.success("URL copiée dans le presse-papiers !", {
			description: shortUrl,
		});
	};

	return (
		<div className="container mx-auto max-w-xl px-4 py-12">
			<div className="grid gap-8">
				<div className="flex w-full max-w-2xl flex-col gap-6">
					<h1 className="font-bold text-3xl">Raccourcisseur d'URL</h1>
					<p className="mb-6 text-center text-muted-foreground">
						Raccourcissez vos URLs en un seul clic.
					</p>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-4 sm:flex-row"
					>
						<div className="flex flex-grow flex-col gap-2">
							<Input placeholder="https://exemple.com" {...register("url")} />
							{errors.url && (
								<p className="text-red-500 text-sm">{errors.url.message}</p>
							)}
						</div>
						<Button type="submit" disabled={createLinkMutation.isPending}>
							{createLinkMutation.isPending ? "En cours..." : "Raccourcir"}
						</Button>
					</form>

					{createLinkMutation.isError && (
						<div className="rounded-lg border bg-red-50 p-4 text-center">
							<p className="font-medium text-red-800">Erreur :</p>
							<p className="text-red-900">{createLinkMutation.error.message}</p>
						</div>
					)}

					{shortUrl && (
						<div className="rounded-lg border bg-green-50 p-4 text-center">
							<p className="font-medium text-green-800">URL raccourcie :</p>
							<div className="mt-2 flex items-center justify-center gap-2">
								<a
									href={shortUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="font-semibold text-green-900 text-lg underline"
								>
									{shortUrl}
								</a>
								<Button size="sm" variant="outline" onClick={copyToClipboard}>
									Copier
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
