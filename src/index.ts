export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		
		// 1. Lógica de generación: Solo ocurre si la URL tiene el parámetro ?render=...
		const promptToGenerate = url.searchParams.get("render");
		
		if (promptToGenerate) {
			const inputs = { prompt: decodeURIComponent(promptToGenerate) };
			
			try {
				const response = await env.AI.run(
					"@cf/stabilityai/stable-diffusion-xl-base-1.0",
					inputs,
				);

				return new Response(response, {
					headers: { 
						"content-type": "image/png",
						"cache-control": "no-store" // Para que no guarde versiones viejas
					},
				});
			} catch (e) {
				return new Response("Error generando imagen", { status: 500 });
			}
		}

		// 2. Interfaz de usuario: Se muestra al cargar la página normalmente
		const html = `
		<!DOCTYPE html>
		<html lang="es">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Generador de Imágenes Profesional</title>
			<script src="https://cdn.tailwindcss.com"></script>
			<style>
				.gradient-bg { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
			</style>
		</head>
		<body class="gradient-bg text-slate-200 min-h-screen flex items-center justify-center p-6">
			
			<div class="w-full max-w-2xl bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
				<header class="text-center mb-10">
					<h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
						AI Studio
					</h1>
					<p class="text-slate-400">Describe lo que tienes en mente y la IA lo creará.</p>
				</header>

				<div class="flex flex-col gap-4">
					<textarea id="promptInput" rows="3" 
						placeholder="Ejemplo: Un astronauta montando un caballo en Marte, estilo digital art, 8k..."
						class="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"></textarea>
					
					<button onclick="generateImage()" id="btn"
						class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2">
						<span id="btnText">Generar Imagen</span>
						<div id="btnLoader" class="hidden animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
					</button>
				</div>

				<div id="resultContainer" class="mt-10 hidden border-t border-slate-700 pt-8">
					<div class="relative group">
						<img id="outputImage" src="" alt="Resultado" class="w-full rounded-xl shadow-inner border border-slate-700 bg-slate-900">
						<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
							<button onclick="downloadImg()" class="bg-white text-black px-4 py-2 rounded-full font-semibold">Descargar</button>
						</div>
					</div>
					<p class="mt-4 text-center text-sm text-slate-500 italic" id="statusText"></p>
				</div>
			</div>

			<script>
				async function generateImage() {
					const prompt = document.getElementById('promptInput').value.trim();
					if (!prompt) return alert("Por favor escribe un prompt.");

					const btn = document.getElementById('btn');
					const btnText = document.getElementById('btnText');
					const btnLoader = document.getElementById('btnLoader');
					const resultContainer = document.getElementById('resultContainer');
					const img = document.getElementById('outputImage');
					const statusText = document.getElementById('statusText');

					// Bloquear UI
					btn.disabled = true;
					btnText.innerText = "Procesando...";
					btnLoader.classList.remove('hidden');
					
					// Construir URL de la API del Worker
					const apiURL = window.location.origin + "?render=" + encodeURIComponent(prompt);

					try {
						// Cargamos la imagen
						img.src = apiURL;
						
						img.onload = () => {
							resultContainer.classList.remove('hidden');
							statusText.innerText = "Prompt: " + prompt;
							resetUI();
						};

						img.onerror = () => {
							alert("Hubo un error en los servidores de AI. Intenta un prompt más corto.");
							resetUI();
						};

					} catch (e) {
						alert("Error de conexión.");
						resetUI();
					}
				}

				function resetUI() {
					const btn = document.getElementById('btn');
					const btnText = document.getElementById('btnText');
					const btnLoader = document.getElementById('btnLoader');
					btn.disabled = false;
					btnText.innerText = "Generar Imagen";
					btnLoader.classList.add('hidden');
				}

				function downloadImg() {
					const img = document.getElementById('outputImage');
					const link = document.createElement('a');
					link.href = img.src;
					link.download = 'ai-generation.png';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			</script>
		</body>
		</html>
		`;

		return new Response(html, {
			headers: { "content-type": "text/html;charset=UTF-8" },
		});
	},
};
