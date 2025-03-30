Project Overview
We’re building a single page application (SPA) that lets users enter YouTube URLs and a natural language instruction. The app will scrape video content using a user-provided API key and then call a large language model (LLM) to generate an article in the requested style. There’s also a verifier loop: after the initial article is generated, another LLM call analyzes its quality and — if needed — triggers an improved version. The entire solution is client-side, with no backend server and no reliance on .env files for API keys.

Tech Stack and Styling
	•	Framework & Build Tool: Use React with Vite for fast build and development.
	•	Styling: Use Tailwind CSS, ensuring the entire app supports a dark theme by default.
	•	Deployment: This is a client-side only SPA.

Operational Requirements
	•	The development server must always launch on the default port.
	•	If the default port is already in use, do not automatically pick a new one. Instead, the startup script should terminate the process currently using that port and then start the new instance on the default port.
	•	All API keys (for YouTube scraping and LLM calls) must be entered via the webpage interface; no API keys should ever be hardcoded or stored in a .env file.

Feature Requirements & Flow
	1.	User Input Screen:
	•	Create an intuitive interface where the user can enter:
	•	Their API key(s) (for YouTube and LLM services).
	•	One or more YouTube URLs.
	•	A free-form natural language instruction (e.g., “Write a LinkedIn article in a sarcastic tone, in first person…”).
	2.	Video Content Scraping:
	•	For each YouTube URL, use the provided API key to fetch and extract relevant video content.
	•	Handle potential errors (e.g., invalid API key, unavailable transcript) gracefully with proper user feedback.
	3.	Content Processing & LLM Call:
	•	Aggregate the scraped content from all provided YouTube URLs.
	•	Pass this aggregated content along with the natural language instruction to the LLM via an API call, requesting an article that meets the specified criteria.
	4.	Verification Loop:
	•	Implement a second LLM call (the “verifier”) that reviews the generated article for suitability and quality.
	•	If the verifier detects issues, it should generate feedback which is then used to modify and re-trigger the original article generation call.
	•	Limit this feedback loop to a maximum of five iterations, but allow for fewer cycles if the article passes verification early.

Development and Code Quality Guidelines:
	•	Component Structure: Organize your code into clear, modular React components.
	•	State Management: Use React’s built-in hooks or a state management library if needed to manage the app state (API keys, YouTube URLs, article content, iteration count, etc.).
	•	Error Handling: Ensure all API calls and asynchronous operations include robust error handling and user notifications.
	•	Testing: Write unit tests for key components and logic (e.g., the verification loop and error handling in the API calls).
	•	Documentation: Comment your code where the logic is non-trivial. Include a README that explains the app’s setup, running instructions, and design choices.

Additional Instructions:
	•	Dark Theme: Ensure that the dark theme is applied consistently across all components.
	•	Port Handling: Modify the startup script (or Vite configuration) so that if the default port is occupied, it will programmatically kill the process on that port before starting the new server—never auto-select a different port.
	•	Security: Since API keys are user-entered on the client side, take extra care to not expose any sensitive logic. Clearly inform the user that keys are handled only in-browser.

UX Requirements:
	•	Must be full responsive
	•	Must be dark mode by default
	•	Must be user-friendly
	•	Must be intuitive
	•	The Max width supported is 1280px

––––––––––––––––––––––––––––––––––––––––––––––––––
Follow these instructions to build a robust, user-friendly, and well-architected SPA. Ask questions if any requirements need clarification before starting development.