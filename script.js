/* ---------- INITIALIZATION ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadFooterContent();
    // renderProducts();
        fetchGalleries();
    setupEventListeners();
    setupParallaxEffect();
    // setupNavigation();
});


async function loadFooterContent() {
  const footer = document.getElementById("footerid");

  try {
    // Fetch Site Settings
    const settingsRes = await fetch("http://127.0.0.1:8000/api/settings/", { mode: "cors" });
    if (!settingsRes.ok) throw new Error(`Settings API failed: ${settingsRes.status}`);
    const settingsData = await settingsRes.json();
    if (!settingsData.length) throw new Error("No site settings found");
    const settings = settingsData[0];

    // Fetch Footer Texts
    const textsRes = await fetch("http://127.0.0.1:8000/api/footer-texts/", { mode: "cors" });
    if (!textsRes.ok) throw new Error(`Footer texts API failed: ${textsRes.status}`);
    const texts = await textsRes.json();
    if (!texts.length) throw new Error("No footer texts found");

    // ---------- FAVICON ----------
    const faviconUrl = settings.footer_logo;
    let favicon = document.querySelector("link[rel~='icon']");
    if (favicon) favicon.remove();

    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = faviconUrl + "?v=" + Date.now(); // cache-busting
    document.head.appendChild(favicon);

    // ---------- FOOTER CONTENT ----------
    const footerContent = document.createElement("div");
    footerContent.classList.add("footer-content");

    const logo = document.createElement("img");
    logo.classList.add("footer-logo");
    logo.width = 120;
    logo.height = 40;
    logo.alt = settings.nav_logo_text + " Logo";
    logo.src = settings.footer_logo;
    footerContent.appendChild(logo);

    const motivational = document.createElement("p");
    motivational.classList.add("motivational-text");
    motivational.textContent = texts[0].text || "";
    footerContent.appendChild(motivational);

    footer.appendChild(footerContent);

    // ---------- ROTATE FOOTER TEXTS ----------
    let index = 1;
    setInterval(() => {
      motivational.style.opacity = 0;
      setTimeout(() => {
        motivational.textContent = texts[index].text;
        motivational.style.opacity = 1;
        index = (index + 1) % texts.length;
      }, 500);
    }, 10000);

  } catch (err) {
    console.error("Footer content could not be loaded:", err);
    // Optional: show fallback in UI
    footer.innerHTML = "<p style='color:red'>Footer content could not be loaded.</p>";
  }
}

let galleryData = []; // stores galleries fetched from API

async function fetchGalleries() {
    try {
        const response = await fetch("http://localhost:8000/api/galleries/");
        if (!response.ok) throw new Error("Failed to fetch galleries");
        const data = await response.json();

        galleryData = data; // store globally
        renderGalleries(data);
        setupNavigation(data);
    } catch (error) {
        document.getElementById("product-content").innerHTML =
            `<p style="color:red;">${error.message}</p>`;
    }
}

function renderGalleries(galleries) {
    const container = document.getElementById("product-content");
    container.innerHTML = "";

    if (galleries.length === 0) return;

    // 1️⃣ Keep the very first gallery fixed at the top
    const featuredGallery = galleries[0];
    const featuredHero = createHeroElement(featuredGallery);
    container.appendChild(featuredHero);

    // 2️⃣ Sort the rest so newest comes first


//  const rest = galleries.slice(1).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // ASC by date
//  const rest = galleries.slice(1).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))// des

    // const rest = galleries.slice(1).sort((a, b) => b.id - a.id); 
    const rest = galleries.slice(1).sort((a, b) => a.id - b.id);

    // If API has created_at, use:
    // const rest = galleries.slice(1).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 3️⃣ Render the rest under the featured
    rest.forEach(gallery => {
        const hero = createHeroElement(gallery);
        container.appendChild(hero);
    });

    setupParallaxEffect();
}

function createHeroElement(gallery) {
    const hero = document.createElement('div');
    hero.className = 'hero';
    hero.id = gallery.nav_title.toLowerCase().replace(/\s+/g, '-');

    hero.innerHTML = `
        <img class="parallax-image" src="${gallery.main_image_url}" alt="${gallery.title}">
        <div class="hero-text parallax-text">
            <h1>${gallery.title}</h1>
            <h2>${gallery.subtitle || ''}</h2>
            <button class="explore-more" data-id="${gallery.id}">Explore More</button>
        </div>
    `;

    hero.querySelector('.explore-more')
        .addEventListener('click', () => openOverviewModal(gallery.id));

    return hero;
}


            const IMAGES_PER_PAGE = 4;
        const VIDEOS_PER_PAGE = 3;
        const MAX_VISIBLE_PAGES = 3;

        /* ---------- GLOBAL STATE ---------- */
        let scale = 1, offsetX = 0, offsetY = 0, isDragging = false, startX = 0, startY = 0;
        let currentItemIndex = 0;
        let currentItemType = 'image';
        let currentGalleryItems = [];   
        let scrollPosition = 0;
        let openModals = 0;
        let isParallaxEnabled = true;

        /* ---------- DOM REFS ---------- */
        const contentContainer = document.getElementById('product-content');
        const imageModal = document.getElementById('image-modal');
        const modalContent = document.querySelector('.modal-content');
        const modalCaption = document.getElementById('modal-caption');
        const closeModalBtn = document.getElementById('close-modal');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const modalPrevBtn = document.getElementById('modal-prev');
        const modalNextBtn = document.getElementById('modal-next');

/* ---------- NAVIGATION SETUP ---------- */
function setupNavigation(galleries = []) {
    if (!galleries || galleries.length === 0) return;

    const wrapper = document.getElementById("nav-links-wrapper");
    const leftBtn = document.getElementById("nav-left");
    const rightBtn = document.getElementById("nav-right");

    let navList = wrapper.querySelector("ul");
    if (!navList) {
        navList = document.createElement("ul");
        navList.id = "nav-links";
        navList.classList.add("nav-links");

        wrapper.appendChild(navList);
    }

    navList.innerHTML = "";

    // Add first gallery
    const firstGallery = galleries[0];
    if (firstGallery) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${firstGallery.nav_title.toLowerCase().replace(/\s+/g, '-')}"><span>${firstGallery.nav_title}</span></a>`;
        navList.appendChild(li);
    }

    // Add remaining galleries
    const rest = galleries.slice(1).sort((a, b) => a.id - b.id);
    const fragment = document.createDocumentFragment();
    rest.forEach(gallery => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#${gallery.nav_title.toLowerCase().replace(/\s+/g, '-')}"><span>${gallery.nav_title}</span></a>`;
        fragment.appendChild(li);
    });
    navList.appendChild(fragment);

    const navLinksEls = navList.querySelectorAll('a');
    const navItems = navList.querySelectorAll('li');

    // Highlight active nav on scroll
    function highlightNav() {
        const sections = document.querySelectorAll('.hero, footer');
        let currentId = "";
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.3) {
                currentId = section.getAttribute("id");
            }
        });

        navLinksEls.forEach(link => {
            const isActive = link.getAttribute("href") === "#" + currentId;
            link.classList.toggle("active", isActive);
            if (isActive) link.scrollIntoView({ behavior: "smooth", inline: "center" });
        });
    }

    window.addEventListener("scroll", highlightNav, { passive: true });
    highlightNav();

    // Smooth scroll on click
    navLinksEls.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // Scroll arrows
    function getItemWidth() {
        return navItems[0]?.offsetWidth + 16 || 100;
    }

function updateArrowVisibility() {
    const maxScrollLeft = navList.scrollWidth - navList.clientWidth;
    leftBtn.style.display = navList.scrollLeft > 0 ? "block" : "none";
    rightBtn.style.display = navList.scrollLeft < maxScrollLeft ? "block" : "none";
}

// Scroll by **one item width** on click
leftBtn.addEventListener("click", () => {
    const itemWidth = navItems[0]?.offsetWidth + 12; // include gap
    navList.scrollBy({ left: -itemWidth, behavior: "smooth" });
});
rightBtn.addEventListener("click", () => {
    const itemWidth = navItems[0]?.offsetWidth + 12;
    navList.scrollBy({ left: itemWidth, behavior: "smooth" });
});

    navList.addEventListener("scroll", updateArrowVisibility);
    window.addEventListener("resize", updateArrowVisibility);
    updateArrowVisibility();

    // Enable swipe/drag scrolling on mobile
    let isDragging = false, startX = 0, scrollLeft = 0;
    navList.addEventListener('mousedown', (e) => {
        isDragging = true;
        navList.classList.add('dragging');
        startX = e.pageX - navList.offsetLeft;
        scrollLeft = navList.scrollLeft;
    });
    navList.addEventListener('mouseleave', () => isDragging = false);
    navList.addEventListener('mouseup', () => isDragging = false);
    navList.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - navList.offsetLeft;
        const walk = (x - startX) * 1; // scroll-fast factor
        navList.scrollLeft = scrollLeft - walk;
    });

    // Touch scrolling (for mobile)
navList.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX - navList.offsetLeft;
    scrollLeft = navList.scrollLeft;
}, { passive: true });

navList.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - navList.offsetLeft;
    const walk = (x - startX) * 1;
    navList.scrollLeft = scrollLeft - walk;
}, { passive: true });
}

function setupParallaxEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroes = document.querySelectorAll('.hero');

    function updateParallax() {
        heroes.forEach((hero, index) => {
            const rect = hero.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const progress = 1 - rect.top / windowHeight;
            const clamped = Math.max(0, Math.min(1, progress));

            if (index === 0) {
                // 🔹 First hero → classic parallax background
                const scrollY = window.scrollY;
                // Move image slower than scroll (feels like fixed background)
                const imageOffset = scrollY * 0.4;

                hero.style.setProperty('--parallax-offset', `${-imageOffset}px`);

                // Keep text centered with very little movement, more visible
                hero.style.setProperty('--text-offset', `${clamped * 10}px`);
                hero.style.setProperty('--button-offset', `${clamped * 5}px`);
                hero.style.setProperty('--text-opacity', 1 - clamped * 0.05);
                hero.style.setProperty('--button-opacity', 1 - clamped * 0.05);
            } else {
                // 🔹 Other heroes → normal parallax effect
                const imageOffset = clamped * 80;   // image goes up
                const textOffset  = clamped * 40;   // text goes down
                const buttonOffset = clamped * 20;

                hero.style.setProperty('--parallax-offset', `${-imageOffset}px`);
                hero.style.setProperty('--text-offset', `${textOffset}px`);
                hero.style.setProperty('--button-offset', `${buttonOffset}px`);

                // Text stays more visible (reduce fade strength)
                hero.style.setProperty('--text-opacity', 1 - clamped * 0.1);
                hero.style.setProperty('--button-opacity', 1 - clamped * 0.1);
            }
        });

        requestAnimationFrame(updateParallax);
    }

    requestAnimationFrame(updateParallax);
}


        /* ---------- SCROLL MANAGEMENT ---------- */
        function saveScrollPosition() {
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        }

        function restoreScrollPosition() {
            window.scrollTo(0, scrollPosition);
            
            // Add a smooth restoration effect
            document.body.classList.add('smooth-restore');
            setTimeout(() => {
                document.body.classList.remove('smooth-restore');
            }, 700);
        }

        /* ---------- MODAL MANAGEMENT ---------- */
        function setupEventListeners() {
            // Close modal event
            closeModalBtn.addEventListener('click', closeImageModal);
            
            // Zoom controls
            zoomInBtn.addEventListener('click', () => zoomImage(1.2));
            zoomOutBtn.addEventListener('click', () => zoomImage(0.8));
            
            // Modal navigation
            modalPrevBtn.addEventListener('click', navigateToPrevItem);
            modalNextBtn.addEventListener('click', navigateToNextItem);
            
            // Wheel zoom
          modalContent.addEventListener('wheel', handleModalWheel, { passive: false });
            
            // Close modal on outside click
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    modalContent.style.animation = 'shake 0.5s';
                    setTimeout(() => modalContent.style.animation = '', 500);
                }
            });
        }

        function openImageModal(item, type, index = 0, itemsArray = []) {
            saveScrollPosition();
            openModals++;
            // disableParallax();
            
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden';

            scale = 1; offsetX = 0; offsetY = 0;
            currentGalleryItems = itemsArray;     
            currentItemIndex = index;             
            currentItemType = type;

            // Clear dynamic children (keep controls)
            Array.from(modalContent.children).forEach(c => {
                if (!['modal-prev', 'modal-next'].includes(c.id)) c.remove();
            });

            if (type === 'image') {
                zoomInBtn.parentNode.style.display = 'flex';
                modalPrevBtn.style.display = 'block';
                modalNextBtn.style.display = 'block';
                showCurrentImage();
            } else {
                zoomInBtn.parentNode.style.display = 'none';
                modalPrevBtn.style.display = 'block';
                modalNextBtn.style.display = 'block';
                showCurrentVideo();
            }
        }

        function closeImageModal() {
            imageModal.classList.remove('show');
            openModals--;
            
            if (openModals <= 0) {
                document.body.style.overflow = 'auto';
                restoreScrollPosition();
                // enableParallax();
            }
            
            setTimeout(() => {
                const modalImg = document.getElementById('modal-img');
                const iframe = modalContent.querySelector('iframe');
                if (modalImg) modalImg.remove();
                if (iframe) { iframe.src = ''; iframe.remove(); }

                const h = document.getElementById('modal-heading');
                const t = document.getElementById('modal-text');
                modalCaption.textContent = '';
                if (h) h.textContent = '';
                if (t) t.textContent = '';
            }, 300);
        }

function showCurrentImage() {
    const imgData = currentGalleryItems[currentItemIndex];
    let modalImg = document.getElementById('modal-img');
    if (!modalImg) {
        modalImg = document.createElement('img');
        modalImg.id = 'modal-img';
        modalContent.appendChild(modalImg);
        enableDrag(modalImg);
    }
    modalImg.src = imgData.image_url; // ✅ use url from API
    modalImg.style.transform = `scale(${scale}) translate(0,0)`;

    // Update footer fields
    const h = document.getElementById('modal-heading');
    const t = document.getElementById('modal-text');
    const c = document.getElementById('modal-caption');
    if (h) h.textContent = imgData.heading || '';
    if (t) t.textContent = imgData.text || '';
    if (c) c.textContent = imgData.caption || '';
}

function showCurrentVideo() { 
    const videoData = currentGalleryItems[currentItemIndex]; 
    let iframe = modalContent.querySelector('iframe'); 
    if (!iframe) { iframe = document.createElement('iframe'); 
        iframe.allow = 'autoplay; encrypted-media; fullscreen'; 
        iframe.frameBorder = '0'; 
        iframe.style.width = '100%'; 
        iframe.style.height = '100%'; 
        modalContent.appendChild(iframe);
     } 
     iframe.src = `https://www.youtube.com/embed/${videoData.youtube_id}?autoplay=1&rel=0`;
    modalCaption.textContent = videoData.caption || "";
}

        function enableDrag(img) {
            img.onmousedown = (e) => {
                isDragging = true;
                startX = e.clientX - offsetX;
                startY = e.clientY - offsetY;
                img.style.cursor = 'grabbing';
            };
            
            window.onmouseup = () => {
                isDragging = false;
                const m = document.getElementById('modal-img');
                if (m) m.style.cursor = 'grab';
            };
            
            window.onmousemove = (e) => {
                if (!isDragging) return;
                offsetX = e.clientX - startX;
                offsetY = e.clientY - startY;
                img.style.transform = `scale(${scale}) translate(${offsetX/scale}px, ${offsetY/scale}px)`;
            };
        }

        function navigateToPrevItem() {
            if (currentItemIndex > 0) {
                currentItemIndex--;
                scale = 1; offsetX = 0; offsetY = 0;
                currentItemType === 'image' ? showCurrentImage() : showCurrentVideo();
            }
        }
        
        function navigateToNextItem() {
            if (currentItemIndex < currentGalleryItems.length - 1) {
                currentItemIndex++;
                scale = 1; offsetX = 0; offsetY = 0;
                currentItemType === 'image' ? showCurrentImage() : showCurrentVideo();
            }
        }

        function zoomImage(factor) {
            const img = document.getElementById('modal-img'); 
            if (!img) return;
            scale *= factor;
            img.style.transform = `scale(${scale}) translate(${offsetX/scale}px, ${offsetY/scale}px)`;
        }
        
        function handleModalWheel(e) {
            const img = document.getElementById('modal-img'); 
            if (!img) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            img.style.transform = `scale(${scale}) translate(${offsetX/scale}px, ${offsetY/scale}px)`;
        }

        /* ---------- PAGINATION ---------- */
        function renderPager(container, totalPages, currentPage, onChange) {
            container.innerHTML = '';
            if (totalPages <= 1) return;

            // Helper function to create pagination buttons
            const makeBtn = (label, page, disabled = false, active = false) => {
                const b = document.createElement('button');
                b.textContent = label;
                if (active) b.classList.add('active');
                if (disabled) b.disabled = true;
                b.onclick = () => onChange(page);
                return b;
            };

            // First / Prev buttons
            container.appendChild(makeBtn('First', 1, currentPage === 1));
            container.appendChild(makeBtn('Prev', Math.max(1, currentPage - 1), currentPage === 1));

            // Numbered window
            const half = Math.floor(MAX_VISIBLE_PAGES / 2);
            let startPage = Math.max(1, Math.min(currentPage - half, totalPages - MAX_VISIBLE_PAGES + 1));
            let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

            if (startPage > 1) {
                const span = document.createElement('span'); 
                span.textContent = '...';
                container.appendChild(span);
            }

            for (let i = startPage; i <= endPage; i++) {
                container.appendChild(makeBtn(String(i), i, false, i === currentPage));
            }

            if (endPage < totalPages) {
                const span = document.createElement('span'); 
                span.textContent = '...';
                container.appendChild(span);
            }

            // Next / Last buttons
            container.appendChild(makeBtn('Next', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
            container.appendChild(makeBtn('Last', totalPages, currentPage === totalPages));
        }

        /* ---------- OVERVIEW MODAL FUNCTIONS ---------- */
function openOverviewModal(productId) {
    saveScrollPosition();
    openModals++;

    const product = galleryData.find(g => g.id === productId); // use find, not index
    if (!product) return;

    let overviewModal = document.getElementById(`overview-modal-${productId}`);
    if (!overviewModal) {
        overviewModal = document.createElement('div');
        overviewModal.id = `overview-modal-${productId}`;
        overviewModal.className = 'overview-modal';
        overviewModal.innerHTML = `
            <div class="overview-header">
                <h2>${product.description_title}</h2>
                <button class="close-overview">×</button>
            </div>
            <div class="overview-body">
                <div class="overview-content active" id="overview-text-${productId}">
                    <p>${product.description_text}</p>
                </div>
                <div class="overview-content" id="overview-images-${productId}">
                    <div class="images" id="overview-images-container-${productId}"></div>
                    <div class="pagination" id="overview-images-pagination-${productId}"></div>
                </div>
                <div class="overview-content" id="overview-videos-${productId}">
                    <div class="images" id="overview-videos-container-${productId}"></div>
                    <div class="pagination" id="overview-videos-pagination-${productId}"></div>
                </div>
            </div>
            <div class="overview-pagination">
                <button class="active" data-target="overview-text-${productId}">Overview</button>
                <button data-target="overview-images-${productId}">Images</button>
                <button data-target="overview-videos-${productId}">Videos</button>
            </div>
        `;
        document.body.appendChild(overviewModal);

        // Close button
        overviewModal.querySelector('.close-overview').addEventListener('click', () => {
            overviewModal.classList.remove('show');
            openModals--;
            if (openModals <= 0) {
                document.body.style.overflow = 'auto';
                restoreScrollPosition();
            }
        });

        // Close on clicking outside
        overviewModal.addEventListener('click', (e) => {
            if (e.target === overviewModal) {
                overviewModal.classList.remove('show');
                openModals--;
                if (openModals <= 0) {
                    document.body.style.overflow = 'auto';
                    restoreScrollPosition();
                }
            }
        });

        // Tab switching
        overviewModal.querySelectorAll('.overview-pagination button').forEach(button => {
            button.addEventListener('click', () => {
                overviewModal.querySelectorAll('.overview-pagination button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                overviewModal.querySelectorAll('.overview-content').forEach(c => c.classList.remove('active'));
                document.getElementById(button.dataset.target).classList.add('active');
            });
        });

        // Render images/videos
        renderOverviewImages(productId, product.images || []);
        renderOverviewVideos(productId, product.videos || []);
    }

    overviewModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Images
function renderOverviewImages(productId, images) {
    const container = document.getElementById(`overview-images-container-${productId}`);
    const paginationContainer = document.getElementById(`overview-images-pagination-${productId}`);
    
    let currentPage = 1;
    const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
    
    function render() {
        const start = (currentPage - 1) * IMAGES_PER_PAGE;
        const end = start + IMAGES_PER_PAGE;
        const pageImages = images.slice(start, end);

        container.innerHTML = '';

        pageImages.forEach((img, i) => {
            const wrap = document.createElement('div');
            const el = document.createElement('img');
            el.src = img.image_url;
            el.alt = img.caption;
            // Pass only the current page items and relative index
            el.onclick = () => openImageModal(img, 'image', i, pageImages);

            wrap.appendChild(el);
            const cap = document.createElement('div'); 
            cap.className = 'caption'; 
            cap.textContent = img.caption || '';
            wrap.appendChild(cap);

            container.appendChild(wrap);
        });

        renderPager(paginationContainer, totalPages, currentPage, (p) => { 
            currentPage = p; 
            render(); 
        });
    }
    
    render();
}


// ========================
// RENDER OVERVIEW VIDEOS
// ========================
function renderOverviewVideos(productId, videos) {
    const container = document.getElementById(`overview-videos-container-${productId}`);
    const paginationContainer = document.getElementById(`overview-videos-pagination-${productId}`);
    
    let currentPage = 1;
    const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
    
    function render() {
        const start = (currentPage - 1) * VIDEOS_PER_PAGE;
        const end = start + VIDEOS_PER_PAGE;
        const pageVideos = videos.slice(start, end);

        container.innerHTML = '';

        pageVideos.forEach((v, i) => {
            const wrap = document.createElement('div');
            const thumb = document.createElement('img');
            thumb.src = `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`;
            thumb.alt = v.caption || '';
            // Pass only the current page items and relative index
            thumb.onclick = () => openImageModal(v, 'video', i, pageVideos);

            wrap.appendChild(thumb);
            const cap = document.createElement('div'); 
            cap.className = 'caption'; 
            cap.textContent = v.caption || '';
            wrap.appendChild(cap);

            container.appendChild(wrap);
        });

        renderPager(paginationContainer, totalPages, currentPage, (p) => { 
            currentPage = p; 
            render(); 
        });
    }
    
    render();
}



    // 
    // 

    