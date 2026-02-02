/**
 * ============================================
 * VALENTINE'S DAY WEBSITE - INTERACTIVE LOGIC
 * ============================================
 * 
 * Core Features:
 * 1. "No" button actively evades cursor (unclickable)
 * 2. "Yes" button triggers celebration
 * 3. Smooth animations and transitions
 * 4. Mobile touch support
 */

// ==================== WAIT FOR DOM TO LOAD ====================
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== GET DOM ELEMENTS ====================
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const buttonZone = document.getElementById('buttonZone');
    const questionView = document.getElementById('questionView');
    const successView = document.getElementById('successView');
    
    // ==================== STATE MANAGEMENT ====================
    let hasAnswered = false; // Tracks if user clicked Yes
    let isEvading = false; // Prevents animation spam
    
    // ==================== CONFIGURATION ====================
    const CONFIG = {
        // Distance at which No button starts evading (pixels)
        EVASION_DISTANCE: 120,
        
        // Minimum distance to move away from cursor
        MIN_ESCAPE_DISTANCE: 180,
        
        // Animation throttle (milliseconds)
        THROTTLE_DELAY: 100
    };
    
    /**
     * ==================== NO BUTTON EVASION LOGIC ====================
     * 
     * HOW IT WORKS:
     * 1. Track mouse/touch position in real-time
     * 2. Calculate distance from cursor to No button center
     * 3. If cursor is within EVASION_DISTANCE:
     *    - Calculate direction AWAY from cursor
     *    - Move button to opposite side of button zone
     *    - Add "nervous" shake animation
     * 4. Button has pointer-events: none (CSS) so it's truly unclickable
     */
    
    /**
     * Get current position of No button
     * @returns {Object} {x, y} coordinates of button center
     */
    function getButtonPosition() {
        const rect = noBtn.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    /**
     * Calculate distance between two points
     * @param {number} x1 - Point 1 X coordinate
     * @param {number} y1 - Point 1 Y coordinate
     * @param {number} x2 - Point 2 X coordinate
     * @param {number} y2 - Point 2 Y coordinate
     * @returns {number} Distance in pixels
     */
    function calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    /**
     * Check if cursor is too close to No button
     * @param {number} cursorX - Cursor X coordinate
     * @param {number} cursorY - Cursor Y coordinate
     * @returns {boolean} True if cursor is within evasion distance
     */
    function isCursorTooClose(cursorX, cursorY) {
        const buttonPos = getButtonPosition();
        const distance = calculateDistance(
            cursorX, 
            cursorY, 
            buttonPos.x, 
            buttonPos.y
        );
        return distance < CONFIG.EVASION_DISTANCE;
    }
    
    /**
     * Move No button away from cursor
     * @param {number} cursorX - Cursor X coordinate
     * @param {number} cursorY - Cursor Y coordinate
     */
    function evadeButton(cursorX, cursorY) {
        // Prevent animation spam
        if (isEvading) return;
        isEvading = true;
        
        // Get button zone boundaries
        const zoneRect = buttonZone.getBoundingClientRect();
        const buttonRect = noBtn.getBoundingClientRect();
        
        // Calculate available space for movement
        const zoneWidth = zoneRect.width;
        const zoneHeight = zoneRect.height;
        const buttonWidth = buttonRect.width;
        const buttonHeight = buttonRect.height;
        
        // Get button's current position relative to button zone
        const buttonPos = getButtonPosition();
        
        // Calculate direction AWAY from cursor
        const directionX = buttonPos.x - cursorX;
        const directionY = buttonPos.y - cursorY;
        
        // Normalize direction
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / magnitude;
        const normalizedY = directionY / magnitude;
        
        // Calculate new position (move away from cursor)
        let newX = buttonPos.x + (normalizedX * CONFIG.MIN_ESCAPE_DISTANCE);
        let newY = buttonPos.y + (normalizedY * CONFIG.MIN_ESCAPE_DISTANCE);
        
        // Convert to position relative to button zone
        newX = newX - zoneRect.left;
        newY = newY - zoneRect.top;
        
        // Ensure button stays within button zone boundaries
        const maxX = zoneWidth - buttonWidth;
        const maxY = zoneHeight - buttonHeight;
        
        newX = Math.max(0, Math.min(newX - buttonWidth / 2, maxX));
        newY = Math.max(0, Math.min(newY - buttonHeight / 2, maxY));
        
        // Apply new position
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
        noBtn.style.transform = 'translate(0, 0)'; // Override center transform
        
        // Add shake animation for visual feedback
        noBtn.classList.add('evading');
        setTimeout(() => {
            noBtn.classList.remove('evading');
        }, 300);
        
        // Reset throttle
        setTimeout(() => {
            isEvading = false;
        }, CONFIG.THROTTLE_DELAY);
    }
    
    /**
     * ==================== MOUSE TRACKING ====================
     * Track mouse movement across entire document
     */
    let lastMouseMove = 0;
    
    document.addEventListener('mousemove', function(event) {
        // Only track if user hasn't answered yet
        if (hasAnswered) return;
        
        // Throttle mouse tracking for performance
        const now = Date.now();
        if (now - lastMouseMove < 16) return; // ~60fps
        lastMouseMove = now;
        
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        // Check if cursor is too close to No button
        if (isCursorTooClose(cursorX, cursorY)) {
            evadeButton(cursorX, cursorY);
        }
    });
    
    /**
     * ==================== TOUCH TRACKING (MOBILE) ====================
     * Similar logic for touch devices
     */
    let lastTouchMove = 0;
    
    document.addEventListener('touchmove', function(event) {
        if (hasAnswered) return;
        if (event.touches.length === 0) return;
        
        const now = Date.now();
        if (now - lastTouchMove < 16) return;
        lastTouchMove = now;
        
        const touch = event.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        if (isCursorTooClose(touchX, touchY)) {
            evadeButton(touchX, touchY);
        }
    }, { passive: true });
    
    /**
     * ==================== PREVENT NO BUTTON CLICKS ====================
     * Extra safety layer (though CSS pointer-events: none handles this)
     */
    noBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🙈 Nice try! But you cannot click the No button! 💕');
        return false;
    });
    
    noBtn.addEventListener('touchstart', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Move button away on mobile touch
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            evadeButton(touch.clientX, touch.clientY);
        }
        return false;
    }, { passive: false });
    
    /**
     * ==================== YES BUTTON SUCCESS LOGIC ====================
     * Handle when user clicks Yes button
     */
    yesBtn.addEventListener('click', function() {
        // Prevent multiple clicks
        if (hasAnswered) return;
        hasAnswered = true;
        
        // Add click feedback
        yesBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            yesBtn.style.transform = '';
        }, 100);
        
        // Hide question view
        questionView.classList.add('hidden');
        
        // Show success view with animation
        setTimeout(() => {
            successView.classList.add('active');
        }, 200);
        
        // Console celebration message
        console.log('🎉💖 THEY SAID YES! 💖🎉');
        
        // Optional: Add sound effect
        // const audio = new Audio('celebration.mp3');
        // audio.play();
    });
    
    /**
     * ==================== KEYBOARD SHORTCUTS ====================
     * Accessibility and Easter eggs
     */
    
    // Press Enter to click Yes
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !hasAnswered) {
            yesBtn.click();
        }
    });
    
    // Easter egg: Press Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !hasAnswered) {
            console.log('🚫 There\'s no escaping love! 💕');
            // Move No button to random position for fun
            const randomX = Math.random() * (buttonZone.offsetWidth - noBtn.offsetWidth);
            const randomY = Math.random() * (buttonZone.offsetHeight - noBtn.offsetHeight);
            noBtn.style.left = randomX + 'px';
            noBtn.style.top = randomY + 'px';
            noBtn.style.transform = 'translate(0, 0)';
        }
    });
    
    /**
     * ==================== INITIALIZE NO BUTTON POSITION ====================
     * Set initial position for No button (offset from Yes button)
     */
    function initializeNoButtonPosition() {
        // Position No button to the right of center initially
        const zoneWidth = buttonZone.offsetWidth;
        const zoneHeight = buttonZone.offsetHeight;
        const buttonWidth = noBtn.offsetWidth;
        
        // Start position: offset from center
        const initialX = (zoneWidth / 2) + 50;
        const initialY = (zoneHeight / 2) - (noBtn.offsetHeight / 2);
        
        noBtn.style.left = initialX + 'px';
        noBtn.style.top = initialY + 'px';
        noBtn.style.transform = 'translate(0, 0)';
    }
    
    // Initialize on load
    setTimeout(initializeNoButtonPosition, 100);
    
    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        if (!hasAnswered) {
            initializeNoButtonPosition();
        }
    });
    
    /**
     * ==================== PERFORMANCE OPTIMIZATION ====================
     * Use requestAnimationFrame for smooth animations
     */
    let rafId = null;
    let pendingMousePosition = null;
    
    function processMousePosition() {
        if (pendingMousePosition && !hasAnswered) {
            const { x, y } = pendingMousePosition;
            if (isCursorTooClose(x, y)) {
                evadeButton(x, y);
            }
            pendingMousePosition = null;
        }
        rafId = null;
    }
    
    // Alternative high-performance mouse tracking
    // (Uncomment to use instead of throttled approach above)
    /*
    document.addEventListener('mousemove', function(event) {
        if (hasAnswered) return;
        
        pendingMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        if (!rafId) {
            rafId = requestAnimationFrame(processMousePosition);
        }
    });
    */
    
    /**
     * ==================== DEBUG MODE ====================
     * Uncomment to visualize evasion distance
     */
    /*
    function drawDebugCircle() {
        const buttonPos = getButtonPosition();
        const circle = document.createElement('div');
        circle.style.position = 'fixed';
        circle.style.left = (buttonPos.x - CONFIG.EVASION_DISTANCE) + 'px';
        circle.style.top = (buttonPos.y - CONFIG.EVASION_DISTANCE) + 'px';
        circle.style.width = (CONFIG.EVASION_DISTANCE * 2) + 'px';
        circle.style.height = (CONFIG.EVASION_DISTANCE * 2) + 'px';
        circle.style.border = '2px dashed red';
        circle.style.borderRadius = '50%';
        circle.style.pointerEvents = 'none';
        circle.style.zIndex = '9999';
        document.body.appendChild(circle);
    }
    
    setInterval(drawDebugCircle, 100);
    */
    
    // ==================== END OF SCRIPT ====================
    console.log('💖 Valentine\'s website loaded successfully! 💖');
});
