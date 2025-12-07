// ============================================
// PARTICLES.JS - Animated Background Particles
// ============================================

function createParticles(count = 50) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.id = 'particles';

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }

    document.body.insertBefore(particlesContainer, document.body.firstChild);
}

// Initialize particles on page load
document.addEventListener('DOMContentLoaded', () => {
    createParticles(50);
});
