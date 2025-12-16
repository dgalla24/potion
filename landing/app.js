/**
 * Potion Landing Page JavaScript
 * Handles form validation, submission, and video modal
 */

// ==========================================================================
// Waitlist Form Handling
// ==========================================================================

// NOTE: Form handling is disabled since we're using Google Forms
// Only initialize if the form elements exist in the DOM

const waitlistForm = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');

// Only set up form handling if the form exists (not using Google Forms)
if (waitlistForm && emailInput && formMessage) {
    /**
     * Validates email format using HTML5 validation + regex check
     * @param {string} email - The email to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Shows a message below the form (success or error)
     * @param {string} message - The message text to display
     * @param {string} type - 'success' or 'error'
     */
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message show ' + type;

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.classList.remove('show');
            }, 5000);
        }
    }

    /**
     * Hides the form message
     */
    function hideMessage() {
        formMessage.classList.remove('show');
    }

    /**
     * Handles form submission
     * POSTs email to /subscribe endpoint by default
     */
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();

        const email = emailInput.value.trim();

        // Validate email
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Disable submit button to prevent double submission
        const submitButton = waitlistForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            // POST to /subscribe endpoint
            const response = await fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                // Success
                showMessage('Thank you! You\'re on the waitlist. Check your email for confirmation.', 'success');
                emailInput.value = ''; // Clear the form
            } else {
                // Server returned an error
                const errorData = await response.json().catch(() => ({}));
                showMessage(
                    errorData.message || 'Something went wrong. Please try again.',
                    'error'
                );
            }
        } catch (error) {
            // Network error or endpoint doesn't exist yet
            console.error('Subscription error:', error);
            showMessage(
                'Unable to connect. The /subscribe endpoint may not be set up yet.',
                'error'
            );
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ==========================================================================
// Video Modal
// ==========================================================================

const videoModal = document.getElementById('video-modal');
const demoVideo = document.getElementById('demo-video');

/**
 * Opens the video modal and plays the demo
 */
function openVideoModal() {
    videoModal.classList.add('open');
    demoVideo.play();

    // Pause video when clicking outside the video element
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // Allow ESC key to close modal
    document.addEventListener('keydown', handleEscapeKey);
}

/**
 * Closes the video modal and pauses playback
 */
function closeVideoModal() {
    videoModal.classList.remove('open');
    demoVideo.pause();
    demoVideo.currentTime = 0; // Reset to beginning

    // Remove ESC key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

/**
 * Handles ESC key press to close modal
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeVideoModal();
    }
}

// Make functions available globally for inline onclick handlers
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;

// ==========================================================================
// Smooth Scroll to Waitlist
// ==========================================================================

/**
 * Smoothly scrolls to the waitlist section
 */
function scrollToWaitlist() {
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
        waitlistSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Focus on email input for accessibility
        setTimeout(() => {
            emailInput.focus();
        }, 500);
    }
}

// Make function available globally
window.scrollToWaitlist = scrollToWaitlist;

// ==========================================================================
// Optional: Analytics Tracking
// ==========================================================================

/**
 * Track custom events (e.g., video plays, form submissions)
 * Uncomment and configure if you're using analytics
 */

// Example: Track when video is played
demoVideo.addEventListener('play', () => {
    // Google Analytics 4 example:
    // gtag('event', 'video_play', { video_name: 'demo' });

    // Plausible Analytics example:
    // plausible('Video Play', { props: { video: 'demo' } });

    console.log('Demo video played'); // For development
});

// Example: Track successful waitlist signups
// (You'd call this from the success handler above)
function trackWaitlistSignup() {
    // Google Analytics 4 example:
    // gtag('event', 'waitlist_signup', { method: 'email' });

    // Plausible Analytics example:
    // plausible('Waitlist Signup');

    console.log('Waitlist signup tracked'); // For development
}

// ==========================================================================
// Initialization
// ==========================================================================

// Log to console when everything is loaded
console.log('Potion landing page loaded successfully!');
