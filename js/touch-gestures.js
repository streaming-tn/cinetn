// ============================================
// TOUCH GESTURES HANDLER - CINÉ TN
// ============================================

class TouchGestureHandler {
    constructor(element, callbacks = {}) {
        this.element = element;
        this.callbacks = callbacks;

        // Gesture tracking
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isTracking = false;

        // Configuration
        this.threshold = 50; // Minimum distance in pixels
        this.maxTime = 500; // Maximum time for swipe in ms
        this.verticalThreshold = 100; // Max vertical movement for horizontal swipe

        this.setupListeners();
    }

    setupListeners() {
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.element.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
        this.isTracking = true;
    }

    handleTouchMove(e) {
        if (!this.isTracking) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.startX);
        const deltaY = Math.abs(touch.clientY - this.startY);

        // Prevent default if horizontal swipe is detected
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.isTracking) return;

        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;
        const deltaTime = endTime - this.startTime;

        this.isTracking = false;

        // Check if it's a valid swipe
        if (deltaTime > this.maxTime) return;
        if (Math.abs(deltaY) > this.verticalThreshold) return;

        const distance = Math.abs(deltaX);
        if (distance < this.threshold) return;

        // Determine swipe direction
        if (deltaX > 0) {
            this.handleSwipeRight(distance);
        } else {
            this.handleSwipeLeft(distance);
        }
    }

    handleSwipeLeft(distance) {
        console.log('👈 Swipe left detected:', distance + 'px');
        if (this.callbacks.onSwipeLeft) {
            this.callbacks.onSwipeLeft(distance);
        }
    }

    handleSwipeRight(distance) {
        console.log('👉 Swipe right detected:', distance + 'px');
        if (this.callbacks.onSwipeRight) {
            this.callbacks.onSwipeRight(distance);
        }
    }

    handleSwipeUp(distance) {
        console.log('👆 Swipe up detected:', distance + 'px');
        if (this.callbacks.onSwipeUp) {
            this.callbacks.onSwipeUp(distance);
        }
    }

    handleSwipeDown(distance) {
        console.log('👇 Swipe down detected:', distance + 'px');
        if (this.callbacks.onSwipeDown) {
            this.callbacks.onSwipeDown(distance);
        }
    }

    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TouchGestureHandler };
}
