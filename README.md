# earthwonders2025.github.io

EarthWonders 2025 is an interactive educational web platform that showcases natural and cosmic phenomena, from volcanoes to the solar system. The project is built as a Single Page Application (SPA) using pure HTML, CSS, and JavaScript, hosted on GitHub Pages, and powered by a RESTful API running on PythonAnywhere. The goal is to create a visually immersive, data-driven experience that updates dynamically without needing manual edits to the site content.

When a user visits the site, the JavaScript automatically fetches gallery data from the PythonAnywhere API endpoint (https://earthwonders2025.pythonanywhere.com/api/galleries/
). Each gallery contains information such as title, subtitle, description, main image URL, and related media like photos or videos. The first gallery returned by the API (for example, “Volcanoes in Action”) is featured as the top hero section with a large parallax image and a dynamic meta title and description. The other galleries are displayed below it, sorted by their ID or creation date.

The system dynamically updates the site’s metadata in the HTML head for SEO optimization. This includes the document title, meta description, and JSON-LD structured data for search engines. This makes the first featured gallery appear as the main indexed item in Google search results. However, since the site is an SPA, only the initial gallery (the one shown when the page loads) is directly indexed by Google, while others are dynamically loaded via JavaScript.

The footer, logos, and motivational texts are also fetched dynamically from PythonAnywhere’s API endpoints for settings and footer-texts. The footer updates automatically without changing any static HTML files. The favicon is also updated dynamically from the API for branding consistency.

Navigation is built dynamically based on the fetched gallery list. Each gallery name appears as a horizontal navigation item, allowing smooth scrolling to its section. The navigation bar supports arrow-based and swipe scrolling for mobile. When a user scrolls through sections, the JavaScript detects the currently visible gallery, updates the navigation highlight, and also updates the page’s meta tags to match the active gallery. This creates a dynamic, app-like experience.

Each gallery section (called a “hero”) includes a background image with a parallax scrolling effect, a title, subtitle, and an “Explore More” button. Clicking this button opens an overview modal for that gallery. Inside the modal, users can view detailed text, image galleries, and YouTube videos. The modal supports pagination, zooming, drag-to-pan images, and swipe gestures for mobile users. Video thumbnails are auto-generated using YouTube’s preview images. The modal content is generated entirely from the API data, making it fully dynamic and scalable for new galleries.

SEO is managed dynamically by the updateMetaTags and addGalleryStructuredData functions. These update the <title>, <meta name="description">, <meta name="keywords">, and add JSON-LD schema objects describing the gallery for search engines. For example, the first gallery might produce structured data with type "ImageGallery" including the title, description, and main images.

The entire site is responsive, lightweight, and animation-optimized. A parallax effect creates smooth motion between sections, and the UI supports both mouse and touch interactions. The design philosophy focuses on simplicity, speed, and visual storytelling. The backend and frontend are completely decoupled, meaning new content can be added via the PythonAnywhere admin panel without changing the website code.

The repository structure includes index.html, script.js, CSS files (header.css, footer.css, overview.css, responsive.css), and an assets folder for images and icons. Deployment is fully automated through GitHub Pages — simply pushing changes to the main branch makes them live.

To improve SEO further, static versions of each gallery (like /volcanoes.html, /solar-system.html) can be added with their own metadata, and a sitemap.xml can list all URLs for better indexing. Alternatively, prerendering tools like Prerender.io or Netlify’s prerendering can serve a snapshot of each view to Googlebot, making every section indexable.

In summary, EarthWonders 2025 is a modern client-side educational showcase combining dynamic data fetching, visual storytelling, and SEO-friendly structure. The site dynamically renders galleries, updates metadata, loads modals for images and videos, and manages navigation — all from a single HTML page. It’s lightweight, extensible, and designed to inspire curiosity about the natural forces that shape Earth and the universe.
