// Update copyright year
// Update copyright year - Move this inside DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Declare translateX and translateY at the top level
let translateX = 0;
let translateY = 0;

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const zoomPercentage = document.getElementById('zoom-percentage');
let currentZoom = 1;
let currentImageIndex = 0;
const galleryImages = document.querySelectorAll('.gallery-item img');

// Add click handlers to gallery images
galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
        currentImageIndex = index;
        showImage(currentImageIndex);
        lightbox.classList.add('active');
    });
});

function showImage(index) {
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;

    currentImageIndex = index;
    lightboxImg.src = galleryImages[currentImageIndex].src;
    lightboxImg.alt = galleryImages[currentImageIndex].alt;

    // Reset zoom and position
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    updateZoomPercentage();
}

function showQRInLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    // Reset zoom and position
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    updateZoomPercentage();
}

function updateZoomPercentage() {
    zoomPercentage.textContent = `${Math.round(currentZoom * 100)}%`;
}

function updateImageTransform() {
    lightboxImg.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
}

// Zoom functionality
function zoomImage(direction) {
    if (direction === 'in') {
        currentZoom += 0.1;
    } else if (direction === 'out' && currentZoom > 0.1) {
        currentZoom -= 0.1;
    }
    updateImageTransform();
    updateZoomPercentage();
}

// Close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
}

// Add event listener for closing the lightbox
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (lightbox.classList.contains('active')) {
        const panAmount = 20; // Amount to pan in pixels

        if (currentZoom > 1) { // Only pan if zoomed in
            switch (event.key) {
                case 'ArrowLeft':
                    translateX -= panAmount;
                    event.preventDefault(); // Prevent default browser scroll
                    break;
                case 'ArrowRight':
                    translateX += panAmount;
                    event.preventDefault(); // Prevent default browser scroll
                    break;
                case 'ArrowUp':
                    translateY -= panAmount;
                    event.preventDefault(); // Prevent default browser scroll
                    break;
                case 'ArrowDown':
                    translateY += panAmount;
                    event.preventDefault(); // Prevent default browser scroll
                    break;
            }
            updateImageTransform(); // Update transform after panning
        }

        // Handle close and zoom regardless of zoom
        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case '+':
                zoomImage('in');
                break;
            case '-':
                zoomImage('out');
                break;
        }
    }
});

// Remove or correct this line
// /

// Ensure the closing bracket and parenthesis are correctly placed


// Load upcoming events from backend
loadEvents();

// Setup donation form
setupDonationForm();


// Load upcoming events from the backend
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const events = await response.json();
        
        // Check if events section exists, if not create it
        let eventsSection = document.getElementById('events');
        if (!eventsSection) {
            // Create events section after features section
            const featuresSection = document.getElementById('features');
            eventsSection = document.createElement('section');
            eventsSection.id = 'events';
            eventsSection.className = 'section';
            
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.innerHTML = '<i class="fas fa-calendar"></i>Upcoming Events';
            
            eventsSection.appendChild(title);
            
            // Create container for events
            const eventsGrid = document.createElement('div');
            eventsGrid.className = 'features-grid';
            eventsGrid.id = 'events-grid';
            eventsSection.appendChild(eventsGrid);
            
            // Insert after features section
            featuresSection.parentNode.insertBefore(eventsSection, featuresSection.nextSibling);
        }
        
        // Get events grid
        const eventsGrid = document.getElementById('events-grid');
        
        // Clear existing events
        eventsGrid.innerHTML = '';
        
        // Add events or show message if none
        if (events.length === 0) {
            const noEvents = document.createElement('p');
            noEvents.textContent = 'No upcoming events at this time. Please check back later.';
            eventsGrid.appendChild(noEvents);
        } else {
            events.forEach(event => {
                const eventDate = new Date(event.event_date);
                
                const eventCard = document.createElement('div');
                eventCard.className = 'feature-card';
                
                eventCard.innerHTML = `
                    <i class="fas fa-calendar-day feature-icon"></i>
                    <h3>${event.title}</h3>
                    <p class="event-date">${eventDate.toLocaleDateString()}</p>
                    <p>${event.description}</p>
                `;
                
                eventsGrid.appendChild(eventCard);
            });
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Add donation form submission handler
function setupDonationForm() {
    const donateSection = document.querySelector('.footer-section:nth-child(4)');
    
    // Create donation form
    const donationForm = document.createElement('form');
    donationForm.id = 'donation-form';
    donationForm.innerHTML = `
        <div class="form-group">
            <input type="text" id="donor-name" placeholder="Your Name (Optional)" class="form-input">
        </div>
        <div class="form-group">
            <input type="email" id="donor-email" placeholder="Your Email (Optional)" class="form-input">
        </div>
        <div class="form-group">
            <input type="number" id="donation-amount" placeholder="Amount (₹)" required class="form-input">
        </div>
        <div class="form-group">
            <select id="donation-purpose" class="form-input">
                <option value="General">General Donation</option>
                <option value="Prasad">Prasad Distribution</option>
                <option value="Maintenance">Temple Maintenance</option>
                <option value="Special Puja">Special Puja</option>
            </select>
        </div>
        <button type="submit" class="donate-button">Donate Now</button>
    `;
    
    // Add form after the QR code
    donateSection.appendChild(donationForm);
    
    // Add event listener for form submission
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('donor-name').value;
        const email = document.getElementById('donor-email').value;
        const amount = document.getElementById('donation-amount').value;
        const purpose = document.getElementById('donation-purpose').value;
        
        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, amount, purpose }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to process donation');
            }
            
            const result = await response.json();
            
            // Show success message
            alert('Thank you for your donation! May Lord Hanuman bless you.');
            
            // Reset form
            donationForm.reset();
            
        } catch (error) {
            console.error('Error processing donation:', error);
            alert('There was an error processing your donation. Please try again later.');
        }
    });
}
// Advertisement Slider
function rotateAds() {
    const slides = document.querySelectorAll('.ad-slide');
    const currentSlide = document.querySelector('.ad-slide.active');
    currentSlide.classList.remove('active');
    
    let nextSlide = currentSlide.nextElementSibling;
    if (!nextSlide) {
        nextSlide = slides[0];
    }
    nextSlide.classList.add('active');
}

setInterval(rotateAds, 3000);

// Donation Features
function showDonationDetails(type) {
    // Remove or comment out this entire block as it's interfering with the modal
    /*
    const details = {
        gaushala: {
            title: 'गौशाला के लिए दान',
            amount: '₹1000 से ₹10000'
        },
        railing: {
            title: 'रेलिंग विकास के लिए दान',
            amount: '₹2000 से ₹20000'
        },
        stairs: {
            title: 'सीढ़ी विकास के लिए दान',
            amount: '₹5000 से ₹50000'
        }
    };
    
    alert(`${details[type].title}\nसुझाई गई राशि: ${details[type].amount}`);
    */
}
const apiUrl = 'http://localhost:8000/api/messages';

// QR Code Modal Functionality
// QR Code Modal Functionality
function showDonationQR(type) {
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qrImage');
    const qrTitle = document.getElementById('qrTitle');
    const closeModal = document.querySelector('.close-modal');

    const qrSources = {
        'railing': './images/QR.jpg',
        'stairs': './images/QR.jpg',
        'gaushala': './images/QR.jpg'
    };
    
    const titles = {
        'railing': 'रेलिंग विकास के लिए दान',
        'stairs': 'सीढ़ी विकास के लिए दान',
        'gaushala': 'गौशाला के लिए दान'
    };

    if (qrSources[type] && titles[type]) {
        qrImage.src = qrSources[type];
        qrTitle.textContent = titles[type];
        qrModal.style.display = 'block';
    }

    // Close button handler
    closeModal.onclick = function() {
        qrModal.style.display = 'none';
    };

    // Click outside to close
    window.onclick = function(event) {
        if (event.target == qrModal) {
            qrModal.style.display = 'none';
        }
    };
}

// Initialize year in footer
document.addEventListener('DOMContentLoaded', function() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Slideshow functionality
let currentSlide = 0;

function showSlides() {
    const slides = document.getElementsByClassName('slides');
    const totalSlides = slides.length;
    const slidesToShow = 3;
    
    // Move all slides
    for (let i = 0; i < totalSlides; i++) {
        slides[i].style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
    
    // Move to next position
    currentSlide++;
    if (currentSlide > totalSlides - slidesToShow) {
        currentSlide = 0;
    }
}

// Initialize slideshow
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.getElementsByClassName('slides');
    if (slides.length > 0) {
        // Set initial positions
        showSlides();
        setInterval(showSlides, 100); // Advance every 7 seconds
    }
});

// Add event listeners for navigation buttons if they exist
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

if (prevButton) {
    prevButton.addEventListener('click', () => changeSlide('prev'));
}

if (nextButton) {
    nextButton.addEventListener('click', () => changeSlide('next'));
}

// Chatbot Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Remove the DOMContentLoaded wrapper since defer already ensures DOM is loaded
    const chatbotContainer = document.getElementById('chatbot-container');
    const openChatbotButton = document.getElementById('open-chatbot-button');
    const closeChatButton = document.getElementById('close-chat');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // Add console logs for debugging
    console.log('Chat elements:', {
        chatbotContainer,
        openChatbotButton,
        closeChatButton,
        chatBox,
        chatInput,
        sendButton
    });
    
    // Event Listeners for chatbot UI elements
    if (openChatbotButton) {
        openChatbotButton.addEventListener('click', () => {
            console.log('Open button clicked');
            if (chatbotContainer) {
                chatbotContainer.classList.add('active');
                console.log('Added active class to container');
            }
            openChatbotButton.classList.add('hidden');
        });
    }

    if (closeChatButton) {
        closeChatButton.addEventListener('click', () => {
            if (chatbotContainer) chatbotContainer.classList.remove('active');
            if (openChatbotButton) openChatbotButton.classList.remove('hidden'); // Show the open button
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            sendMessageToServer(chatInput.value);
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessageToServer(chatInput.value);
            }
        });
    }
    
    // Initial greeting from the chatbot when it's first opened or page loads
    // This can be customized or triggered differently
    // addMessageToChat('Namaste! How can I help you today?', 'received');
});

// Inside the button click handler section
donateButtons.forEach(button => {
    button.addEventListener('click', function() {
        const type = this.dataset.type;
        if (qrData[type]) {
            const data = qrData[type];
            qrImage.src = data.src;
            qrTitle.textContent = data.title;
            modal.style.display = 'block';
        }
    });
});