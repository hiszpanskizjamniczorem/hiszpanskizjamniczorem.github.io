/**
 * script.js - JavaScript functionalities for Hiszpański z jamniczorem
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Navbar Setup ---
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Check initial scroll position
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // --- Mobile Menu Toggle ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon
            if (navLinks.classList.contains('active')) {
                menuBtn.innerHTML = '✕';
            } else {
                menuBtn.innerHTML = '☰';
            }
        });
    }

    // --- Smooth Scrolling for Navigation Links & Close Mobile Menu ---
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Zamknięcie menu mobilnego po kliknięciu
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '☰';
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                // Odejmij wysokość navbaru, by kontent nie był ucięty na górze
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Animation Observer (optional scroll reveal) ---
    // Można dodać proste animacje zanikania po wjechaniu w ekran
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aby z tego skorzystać, musielibyśmy dodać CSS:
    // .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    // Ale w tej wersji zachowujemy stronę lżejszą w użyciu CSS.
    // --- Reviews Slider ---
    const slider = document.getElementById('reviews-slider');
    const prevBtn = document.getElementById('prev-review');
    const nextBtn = document.getElementById('next-review');

    if (slider && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const card = slider.querySelector('.review-card');
            if (card) {
                const cardWidth = card.offsetWidth + 30; // card + gap
                slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        });

        prevBtn.addEventListener('click', () => {
            const card = slider.querySelector('.review-card');
            if (card) {
                const cardWidth = card.offsetWidth + 30; // card + gap
                slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            }
        });

        // Optional: Manual swipe/drag behavior can be added with library, 
        // but scroll-snap handles native touch beautifully.
    }
});
