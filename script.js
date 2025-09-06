// Create animated background particles
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particleContainer.appendChild(particle);
    }
}

// Create floating geometric shapes
function createFloatingShapes() {
    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'floating-shapes';
    document.body.appendChild(shapesContainer);
    
    const shapes = ['circle', 'triangle', 'square'];
    for (let i = 0; i < 4; i++) {
        const shape = document.createElement('div');
        shape.className = `floating-shape ${shapes[Math.floor(Math.random() * shapes.length)]}`;
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = Math.random() * 100 + '%';
        shape.style.animationDelay = Math.random() * 10 + 's';
        shapesContainer.appendChild(shape);
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle effects
    createParticles();
    createFloatingShapes();
    // Add smooth scrolling to internal navigation links only
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Don't prevent default for mailto, tel, or external links
            if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
                return; // Let the browser handle these links normally
            }
            
            e.preventDefault();
            
            const targetSection = document.querySelector(href);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animated Counter Function
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Intersection Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                stat.classList.add('animate');
                
                // Animate counter
                const counter = stat.querySelector('.counter');
                if (counter && !counter.classList.contains('animated')) {
                    counter.classList.add('animated');
                    setTimeout(() => {
                        animateCounter(counter);
                    }, 300);
                }
            }
        });
    }, {
        threshold: 0.5
    });

    // Observe all stat elements
    document.querySelectorAll('.stat').forEach(stat => {
        statsObserver.observe(stat);
    });

    // Navigation scroll spy
    const navSections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = '';
        navSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Call once on load

    // Add scroll effect to navigation
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Add animation on scroll for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Add typing effect to hero title with blinking name
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.innerHTML += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            } else {
                // Make entire name blink instead of just cursor
                heroTitle.innerHTML = `<span class="blinking-name">${originalText}</span>`;
            }
        };
        
        setTimeout(typeWriter, 1000);
    }

    // Add typing effect to hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.innerHTML;
        heroSubtitle.innerHTML = '';
        heroSubtitle.style.opacity = '0';
        
        setTimeout(() => {
            heroSubtitle.style.opacity = '1';
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    heroSubtitle.innerHTML += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            typeWriter();
        }, 2500);
    }

    // Animate hero description with fade-in
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        heroDescription.style.opacity = '0';
        heroDescription.style.transform = 'translateY(20px)';
        setTimeout(() => {
            heroDescription.style.transition = 'opacity 1s ease, transform 1s ease';
            heroDescription.style.opacity = '1';
            heroDescription.style.transform = 'translateY(0)';
        }, 4000);
    }

    // Social links - no animations
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link) => {
        link.style.opacity = '1';
        link.style.transform = 'none';
        link.style.filter = 'none';
        link.style.transition = 'none';
    });

    // Simplified profile avatar animation - just gentle floating
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        setInterval(() => {
            profileAvatar.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                profileAvatar.style.transform = 'translateY(0)';
            }, 1000);
        }, 3000);
    }

    // Mouse trail disabled - was too distracting

    // Add text reveal animation on scroll
    const textElements = document.querySelectorAll('p, h1, h2, h3');
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'textReveal 1s ease forwards';
            }
        });
    }, { threshold: 0.1 });
    
    textElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        textObserver.observe(el);
    });

    // Remove glitch effect - was causing name to disappear

    // Add hover effects to project cards and skill items
    const projectCards = document.querySelectorAll('.project-card, .skill-item, .contact-method');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });

    // Add pulse animation to navigation links on hover
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });

    // Add shake animation to stats when they animate
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = 'shake 0.8s ease-in-out';
                    }, 500);
                }
            });
        });
        observer.observe(stat);
    });

    // Optimized parallax effect with throttling
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero, .about, .skills, .projects, .contact');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.05);
            element.style.transform = `translate3d(0, ${scrolled * speed * 0.05}px, 0)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Simplified section animations - just fade in
    const animatedSections = document.querySelectorAll('section');
    
    animatedSections.forEach((section) => {
        section.style.opacity = '0';
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                    entry.target.style.opacity = '1';
                }
            });
        }, { threshold: 0.2 });
        
        sectionObserver.observe(section);
    });

    // Add click effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cursor {
        animation: blink 1s infinite;
        color: #007bff;
    }
    
    .blinking-name {
        color: #ff6b9d;
        display: inline;
    }
    
    @keyframes blink {
        0%, 70% { opacity: 1; }
        71%, 100% { opacity: 0.3; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .profile-avatar {
        transition: transform 1s ease-in-out;
    }
    
    .social-link {
        transition: all 0.3s ease;
        transform: scale(1);
    }
    
    .social-link:hover {
        color: #ff6b9d;
        transform: scale(1.2);
        text-shadow: 0 0 15px rgba(255, 107, 157, 0.8);
        filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.6));
    }
    
    .social-link:active {
        color: #e91e63;
        transform: scale(1.1);
    }
    
    .nav-link {
        transition: all 0.3s ease;
    }
    
    .section-title {
        animation: fadeInUp 1s ease;
    }
    
    .contact-method, .skill-item {
        transition: all 0.3s ease;
    }
    
    /* Particle Effects */
    .particles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    
    .particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: #007bff;
        border-radius: 50%;
        animation: float 25s infinite linear;
        opacity: 0.3;
        will-change: transform;
    }
    
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.7;
        }
        90% {
            opacity: 0.7;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    /* Floating Shapes */
    .floating-shapes {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    
    .floating-shape {
        position: absolute;
        animation: floatShape 30s infinite ease-in-out;
        opacity: 0.05;
        will-change: transform;
    }
    
    .floating-shape.circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
    }
    
    .floating-shape.triangle {
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 20px solid #00d4ff;
    }
    
    .floating-shape.square {
        width: 15px;
        height: 15px;
        background: #ff6b6b;
        transform: rotate(45deg);
    }
    
    @keyframes floatShape {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
        }
        25% {
            transform: translateY(-20px) rotate(90deg);
        }
        50% {
            transform: translateY(-40px) rotate(180deg);
        }
        75% {
            transform: translateY(-20px) rotate(270deg);
        }
    }
    
    /* Mouse Trail */
    .mouse-trail {
        position: fixed;
        width: 4px;
        height: 4px;
        background: #007bff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: trailFade 0.8s ease-out forwards;
        will-change: transform, opacity;
    }
    
    @keyframes trailFade {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.2);
        }
    }
    
    /* Text Reveal Animation */
    @keyframes textReveal {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Glitch Effect */
    @keyframes glitch {
        0% {
            transform: translate(0);
        }
        20% {
            transform: translate(-2px, 2px);
        }
        40% {
            transform: translate(-2px, -2px);
        }
        60% {
            transform: translate(2px, 2px);
        }
        80% {
            transform: translate(2px, -2px);
        }
        100% {
            transform: translate(0);
        }
    }
    
    /* Section Entrance Animations */
    @keyframes slideInLeft {
        0% {
            opacity: 0;
            transform: translateX(-100px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        0% {
            opacity: 0;
            transform: translateX(100px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes zoomIn {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes rotateIn {
        0% {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
        }
        100% {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }
    }
    
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
