export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const prompt = url.searchParams.get("prompt");

		// CASO 1: Si hay un prompt, generamos la imagen
		if (prompt) {
			const inputs = { prompt: prompt };
			const response = await env.AI.run(
				"@cf/stabilityai/stable-diffusion-xl-base-1.0",
				inputs,
			);

			return new Response(response, {
				headers: { "content-type": "image/png" },
			});
		}

		// CASO 2: Si NO hay prompt, mostramos la interfaz HTML
		const html = `
		<!DOCTYPE html>
		<html lang="es">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Generador de Imágenes AI</title>
			<script src="https://cdn.tailwindcss.com"></script>
		</head>
		<body class="bg-slate-900 text-white flex flex-col items-center justify-center min-h-screen p-4">
			<div class="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
				<h1 class="text-2xl font-bold mb-6 text-center text-blue-400">AI Image Generator</h1>
				
				<div class="space-y-4">
					<input type="text" id="promptInput" placeholder="Ej: A futuristic city in Mars..." 
						class="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
					
					<button onclick="generate()" id="btn"
						class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition duration-200">
						Generar Imagen
					</button>
				</div>

				<div id="result" class="mt-8 hidden text-center">
					<p class="mb-4 text-sm text-slate-400">Resultado:</p>
					<img id="outputImage" class="rounded-lg shadow-lg w-full border border-slate-600" src="" alt="AI Result">
					<a id="downloadBtn" class="block mt-4 text-blue-400 underline text-sm" href="" download="ai-image.png">Descargar imagen</a>
				</div>

				<div id="loader" class="mt-8 hidden text-center">
					<div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
					<p class="mt-2 text-slate-400">Creando tu arte... sé paciente.</p>
				</div>
			</div>

			<script>
				async function generate() {
					const prompt = document.getElementById('promptInput').value;
					if (!prompt) return alert('Escribe algo primero');

					const btn = document.getElementById('btn');
					const loader = document.getElementById('loader');
					const result = document.getElementById('result');
					const img = document.getElementById('outputImage');
					const downloadBtn = document.getElementById('downloadBtn');

					// UI State
					btn.disabled = true;
					btn.innerText = 'Generando...';
					loader.classList.remove('hidden');
					result.classList.add('hidden');

					try {
						// Llamamos al mismo Worker pasando el prompt por la URL
						const imageUrl = window.location.origin + '?prompt=' + encodeURIComponent(prompt);
						
						// Forzamos la carga de la imagen
						img.src = imageUrl;
						
						img.onload = () => {
							loader.classList.add('hidden');
							result.classList.remove('hidden');
							btn.disabled = false;
							btn.innerText = 'Generar Imagen';
							downloadBtn.href = imageUrl;
						};
					} catch (e) {
						alert('Error al generar');
						btn.disabled = false;
					}
				}
			</script>
		</body>
		</html>
		`;

		return new Response(html, {
			headers: { "content-type": "text/html;charset=UTF-8" },
		});
	},
} satisfies ExportedHandler<Env>;
