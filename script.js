/*
 * Akua Suites Web Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navAnchors = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const expanded = navLinks.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', expanded);
        });

        navAnchors.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }

                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        observer.observe(el);
    });

    // --- Amenities Tabbed Carousel logic ---
    const tabs = document.querySelectorAll('.amenity-tab');
    const panels = document.querySelectorAll('.amenity-panel');
    const wrapper = document.querySelector('.amenities-wrapper');

    if (tabs.length > 0 && panels.length > 0) {
        let tabInterval = 6000; // 6 seconds per tab
        let lastTime = null;
        let elapsed = 0;
        let activeIndex = 0;
        let isPaused = false;
        let animationFrameId = null;

        function switchTab(index) {
            tabs.forEach((tab, idx) => {
                const fill = tab.querySelector('.progress-bar-fill');
                if (fill) fill.style.width = '0%';

                if (idx === index) {
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                } else {
                    tab.classList.remove('active');
                    tab.setAttribute('aria-selected', 'false');
                }
            });

            panels.forEach((panel, idx) => {
                if (idx === index) {
                    panel.classList.add('active');
                    panel.removeAttribute('hidden');
                } else {
                    panel.classList.remove('active');
                    panel.setAttribute('hidden', '');
                }
            });

            activeIndex = index;
            elapsed = 0;

            // Scroll tab into view on mobile
            if (window.innerWidth <= 900) {
                const tabsContainer = document.querySelector('.amenities-tabs');
                const activeTab = tabs[index];
                if (tabsContainer && activeTab) {
                    const containerWidth = tabsContainer.clientWidth;
                    const tabLeft = activeTab.offsetLeft;
                    const tabWidth = activeTab.clientWidth;
                    tabsContainer.scrollTo({
                        left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
                        behavior: 'smooth'
                    });
                }
            }
        }

        function step(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;

            if (!isPaused) {
                elapsed += delta;
                if (elapsed >= tabInterval) {
                    elapsed = 0;
                    switchTab((activeIndex + 1) % tabs.length);
                } else {
                    const activeProgressBarFill = tabs[activeIndex].querySelector('.progress-bar-fill');
                    if (activeProgressBarFill) {
                        const percentage = (elapsed / tabInterval) * 100;
                        activeProgressBarFill.style.width = `${percentage}%`;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(step);
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                switchTab(index);
                lastTime = performance.now(); // reset time frame on manual select
            });
        });

        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => {
                isPaused = true;
            });
            wrapper.addEventListener('mouseleave', () => {
                isPaused = false;
                lastTime = performance.now();
            });

            // Mobile touch pause
            wrapper.addEventListener('touchstart', () => {
                isPaused = true;
            }, { passive: true });
            wrapper.addEventListener('touchend', () => {
                isPaused = false;
                lastTime = performance.now();
            }, { passive: true });
        }

        // Initialize carousel
        switchTab(0);
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(step);
    }

    // --- Experiences Auto-Scrolling Carousel logic ---
    const expGrid = document.querySelector('.experience-grid');
    const expItems = document.querySelectorAll('.experience-item');

    if (expGrid && expItems.length > 1) {
        let expIndex = 0;
        const expInterval = 5000; // auto-scroll every 5 seconds
        let expTimer = null;
        let expIsPaused = false;

        function startExpTimer() {
            stopExpTimer();
            expTimer = setInterval(() => {
                if (!expIsPaused) {
                    expIndex = (expIndex + 1) % expItems.length;
                    scrollToExp(expIndex);
                }
            }, expInterval);
        }

        function stopExpTimer() {
            if (expTimer) {
                clearInterval(expTimer);
                expTimer = null;
            }
        }

        function scrollToExp(index) {
            const item = expItems[index];
            if (item) {
                // Centrar el elemento en el contenedor
                const targetScroll = item.offsetLeft - (expGrid.clientWidth - item.clientWidth) / 2;
                expGrid.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        }

        // Pause on hover / touch
        expGrid.addEventListener('mouseenter', () => {
            expIsPaused = true;
        });
        expGrid.addEventListener('mouseleave', () => {
            expIsPaused = false;
        });

        expGrid.addEventListener('touchstart', () => {
            expIsPaused = true;
        }, { passive: true });
        expGrid.addEventListener('touchend', () => {
            expIsPaused = false;
            lastTime = performance.now();
        }, { passive: true });

        // Update expIndex dynamically on manual scroll
        let scrollTimeout = null;
        expGrid.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const gridCenter = expGrid.scrollLeft + expGrid.clientWidth / 2;
                let closestIndex = 0;
                let minDistance = Infinity;

                expItems.forEach((item, idx) => {
                    const itemCenter = item.offsetLeft + item.clientWidth / 2;
                    const distance = Math.abs(gridCenter - itemCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = idx;
                    }
                });

                expIndex = closestIndex;
            }, 150);
        }, { passive: true });

        startExpTimer();
    }

    // --- Suites Luxury Carousel (Ritz-Carlton inspired) logic ---
    const suiteTrack = document.querySelector('.suite-carousel-track');
    const suiteSlides = document.querySelectorAll('.suite-slide');
    const suiteBtnPrev = document.querySelector('.btn-prev');
    const suiteBtnNext = document.querySelector('.btn-next');
    const suiteProgressFill = document.querySelector('.carousel-progress-fill');
    const suiteIndexDisplay = document.querySelector('.suite-carousel-index');

    if (suiteTrack && suiteSlides.length > 0) {
        let currentSuiteIndex = 0;

        function updateSuiteCarousel(index) {
            const slide = suiteSlides[index];
            if (slide) {
                const targetScroll = slide.offsetLeft - suiteTrack.offsetLeft - (suiteTrack.clientWidth - slide.clientWidth) / 2;
                suiteTrack.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
            if (suiteProgressFill) {
                suiteProgressFill.style.width = `${((index + 1) / suiteSlides.length) * 100}%`;
            }
            if (suiteIndexDisplay) {
                suiteIndexDisplay.textContent = `${index + 1} / ${suiteSlides.length}`;
            }
            currentSuiteIndex = index;
        }

        if (suiteBtnPrev) {
            suiteBtnPrev.addEventListener('click', () => {
                const nextIndex = (currentSuiteIndex - 1 + suiteSlides.length) % suiteSlides.length;
                updateSuiteCarousel(nextIndex);
            });
        }

        if (suiteBtnNext) {
            suiteBtnNext.addEventListener('click', () => {
                const nextIndex = (currentSuiteIndex + 1) % suiteSlides.length;
                updateSuiteCarousel(nextIndex);
            });
        }

        // Sync index on manual trackpad/touch scroll
        let suiteScrollTimeout;
        suiteTrack.addEventListener('scroll', () => {
            clearTimeout(suiteScrollTimeout);
            suiteScrollTimeout = setTimeout(() => {
                const trackCenter = suiteTrack.scrollLeft + suiteTrack.clientWidth / 2;
                let closestIndex = 0;
                let minDistance = Infinity;

                suiteSlides.forEach((slide, idx) => {
                    const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
                    const distance = Math.abs(trackCenter - slideCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = idx;
                    }
                });

                if (closestIndex !== currentSuiteIndex) {
                    if (suiteProgressFill) {
                        suiteProgressFill.style.width = `${((closestIndex + 1) / suiteSlides.length) * 100}%`;
                    }
                    if (suiteIndexDisplay) {
                        suiteIndexDisplay.textContent = `${closestIndex + 1} / ${suiteSlides.length}`;
                    }
                    currentSuiteIndex = closestIndex;
                }
            }, 100);
        }, { passive: true });

        // Initialize state
        updateSuiteCarousel(0);
    }

    // Toggle navbar transparency on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const toggleNavbarScrolled = () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
        // Set initial state on page load/refresh
        toggleNavbarScrolled();
        window.addEventListener('scroll', toggleNavbarScrolled, { passive: true });
    }

    // --- Gallery Lightbox ---
    const galleryItems = document.querySelectorAll('.gallery-item[data-src]');

    if (galleryItems.length > 0) {
        // Build lightbox DOM
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Cerrar">✕</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Anterior">‹</button>
            <img class="lightbox-image" src="" alt="Foto de la suite">
            <button class="lightbox-nav lightbox-next" aria-label="Siguiente">›</button>
            <span class="lightbox-counter"></span>
        `;
        document.body.appendChild(overlay);

        const lbImage = overlay.querySelector('.lightbox-image');
        const lbCounter = overlay.querySelector('.lightbox-counter');
        const lbClose = overlay.querySelector('.lightbox-close');
        const lbPrev = overlay.querySelector('.lightbox-prev');
        const lbNext = overlay.querySelector('.lightbox-next');
        let currentLbIndex = 0;

        function openLightbox(index) {
            currentLbIndex = index;
            updateLightbox();
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function updateLightbox() {
            const src = galleryItems[currentLbIndex].getAttribute('data-src');
            lbImage.src = src;
            lbCounter.textContent = `${currentLbIndex + 1} / ${galleryItems.length}`;
        }

        function nextImage() {
            currentLbIndex = (currentLbIndex + 1) % galleryItems.length;
            updateLightbox();
        }

        function prevImage() {
            currentLbIndex = (currentLbIndex - 1 + galleryItems.length) % galleryItems.length;
            updateLightbox();
        }

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        lbClose.addEventListener('click', closeLightbox);
        lbPrev.addEventListener('click', prevImage);
        lbNext.addEventListener('click', nextImage);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });
    }

    // --- Suite Gallery Carousel ---
    const suiteGalleryTrack = document.querySelector('.suite-gallery-carousel .carousel-track');
    const suiteGallerySlides = document.querySelectorAll('.suite-gallery-carousel .carousel-slide');
    const suiteGalleryPrevBtn = document.querySelector('.suite-gallery-carousel .prev-btn');
    const suiteGalleryNextBtn = document.querySelector('.suite-gallery-carousel .next-btn');
    const suiteGalleryDots = document.querySelectorAll('.suite-gallery-carousel .dot');
    const suiteGalleryViewport = document.querySelector('.suite-gallery-carousel .carousel-track-viewport');

    if (suiteGalleryTrack && suiteGallerySlides.length > 0) {
        let currentIndex = 0;
        let autoplayTimer = null;
        const intervalTime = 5000; // rotate every 5 seconds

        function adjustViewportHeight(img) {
            if (suiteGalleryViewport && img) {
                const parentWidth = suiteGalleryViewport.parentElement.clientWidth;
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                if (naturalWidth && naturalHeight) {
                    let targetWidth = parentWidth;
                    let targetHeight = (targetWidth / naturalWidth) * naturalHeight;
                    
                    // Cap the height to 60% of screen height or 480px max on desktop
                    const maxHeight = Math.min(window.innerHeight * 0.6, 480);
                    if (targetHeight > maxHeight) {
                        targetHeight = maxHeight;
                        // Shrink width proportionally to prevent empty bars on the sides
                        targetWidth = (targetHeight / naturalHeight) * naturalWidth;
                    }
                    
                    suiteGalleryViewport.style.height = `${targetHeight}px`;
                    suiteGalleryViewport.style.width = `${targetWidth}px`;
                }
            }
        }

        function updateCarousel(index) {
            currentIndex = (index + suiteGallerySlides.length) % suiteGallerySlides.length;

            suiteGallerySlides.forEach((slide, idx) => {
                if (idx === currentIndex) {
                    slide.classList.add('active');
                    const img = slide.querySelector('img');
                    if (img) {
                        if (img.complete) {
                            adjustViewportHeight(img);
                        } else {
                            img.addEventListener('load', () => {
                                if (idx === currentIndex) {
                                    adjustViewportHeight(img);
                                }
                            });
                        }
                    }
                } else {
                    slide.classList.remove('active');
                }
            });

            // Update dots
            suiteGalleryDots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function nextSlide() {
            updateCarousel(currentIndex + 1);
        }

        function prevSlide() {
            updateCarousel(currentIndex - 1);
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(nextSlide, intervalTime);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        // Navigation controls
        if (suiteGalleryPrevBtn) {
            suiteGalleryPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent trigger lightbox click
                prevSlide();
                startAutoplay();
            });
        }

        if (suiteGalleryNextBtn) {
            suiteGalleryNextBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent trigger lightbox click
                nextSlide();
                startAutoplay();
            });
        }

        suiteGalleryDots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent trigger lightbox click
                updateCarousel(idx);
                startAutoplay();
            });
        });

        // Pause autoplay on mouse enter / touch
        const carouselContainer = document.querySelector('.suite-gallery-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoplay);
            carouselContainer.addEventListener('mouseleave', startAutoplay);
            carouselContainer.addEventListener('touchstart', stopAutoplay, { passive: true });
            carouselContainer.addEventListener('touchend', startAutoplay, { passive: true });
        }

        // Keep responsive height adjusted on window resize
        window.addEventListener('resize', () => {
            const activeSlide = suiteGallerySlides[currentIndex];
            if (activeSlide) {
                const img = activeSlide.querySelector('img');
                if (img) adjustViewportHeight(img);
            }
        });

        // Initialize carousel
        updateCarousel(0);
        startAutoplay();
    }
});
