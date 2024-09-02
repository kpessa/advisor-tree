import App from './App.svelte';
import { processData } from './data/app.js';

async function startApp() {
	try {
		const processedData = await processData();
		
		const app = new App({
			target: document.body,
			props: {
				treeData: processedData
			}
		});

		return app;
	} catch (error) {
		console.error('Error starting the app:', error);
	}
}

startApp();