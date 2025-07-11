// Update copyright year
// Declare global variables
let translateX = 0;
let translateY = 0;
let currentZoom = 1;
let currentImageIndex = 0;
let currentSlide = 0; // For slideshow

// Panning state variables
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let initialPanTranslateX = 0;
let initialPanTranslateY = 0;


// Add any existing JavaScript here

document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navContainer = document.querySelector('.nav-bar .nav-container');

    if (mobileNavToggle && navContainer) {
        mobileNavToggle.addEventListener('click', () => {
            navContainer.classList.toggle('active');
        });

        // Close the mobile menu when a link is clicked
        navContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navContainer.classList.remove('active');
            });
        });
    }
});


// Main DOMContentLoaded listener
window.addEventListener('DOMContentLoaded', () => {
    // Update copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const zoomPercentage = document.getElementById('zoom-percentage');
    const galleryImages = document.querySelectorAll('.slideshow-container .slides img');
    const lightboxCloseButton = document.querySelector('.lightbox-close');

    if (galleryImages.length > 0 && lightbox && lightboxImg && zoomPercentage && lightboxCloseButton) {
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                currentImageIndex = index;
                showImage(index, galleryImages, lightboxImg, lightbox, zoomPercentage);
            });
        });

        if (lightboxCloseButton && !lightboxCloseButton.onclick) {
            lightboxCloseButton.addEventListener('click', () => closeLightbox(lightbox));
        }

        // Panning event listeners for lightbox image
        if (lightboxImg) {
            lightboxImg.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove); // Listen on document for smoother dragging
            document.addEventListener('mouseup', handleMouseUpOrLeave); // Listen on document
            lightboxImg.addEventListener('mouseleave', handleMouseUpOrLeave); // Handle mouse leaving the image itself
        }
    }

    loadEvents();
    // setupDonationForm(); - Removed donation form setup

    const slides = document.getElementsByClassName('slides');
    if (slides.length > 0) {
        showSlides();
        setInterval(showSlides, 5000);
    }

    const chatbotContainer = document.getElementById('chatbot-container');
    const openChatbotButton = document.getElementById('open-chatbot-button');
    const closeChatButton = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    if (openChatbotButton && chatbotContainer) {
        openChatbotButton.addEventListener('click', () => {
            chatbotContainer.classList.add('active');
            openChatbotButton.classList.add('hidden');
        });
    }

    if (closeChatButton && chatbotContainer && openChatbotButton) {
        closeChatButton.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
            openChatbotButton.classList.remove('hidden');
        });
    }

    if (sendButton && chatInput) {
        sendButton.addEventListener('click', () => sendMessageToServer(chatInput.value));
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessageToServer(chatInput.value);
        });
    }
}); // End of DOMContentLoaded

function handleMouseDown(e) {
    const lightboxImg = document.getElementById('lightbox-img');
    if (currentZoom > 1 && lightboxImg) {
        e.preventDefault(); // Prevent default image drag
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        initialPanTranslateX = translateX;
        initialPanTranslateY = translateY;
        lightboxImg.classList.add('panning');
        lightboxImg.classList.remove('pannable');
    }
}

function handleMouseMove(e) {
    if (isPanning) {
        const lightboxImg = document.getElementById('lightbox-img');
        if (!lightboxImg) return;

        const dx = e.clientX - panStartX;
        const dy = e.clientY - panStartY;
        // Adjust movement by zoom level for intuitive panning
        translateX = initialPanTranslateX + (dx / currentZoom);
        translateY = initialPanTranslateY + (dy / currentZoom);
        updateImageTransform(lightboxImg);
    }
}

function handleMouseUpOrLeave() {
    if (isPanning) {
        const lightboxImg = document.getElementById('lightbox-img');
        isPanning = false;
        if (lightboxImg) {
            lightboxImg.classList.remove('panning');
            if (currentZoom > 1) {
                lightboxImg.classList.add('pannable');
            }
        }
    }
}

// Lightbox specific functions
function showImage(index, galleryImgs, lightboxImgElement, lightboxElement, zoomPercentageElement) {
    if (!galleryImgs || galleryImgs.length === 0 || !lightboxImgElement || !lightboxElement || !zoomPercentageElement) return;

    if (index < 0) index = galleryImgs.length - 1;
    if (index >= galleryImgs.length) index = 0;

    currentImageIndex = index;
    lightboxImgElement.src = galleryImgs[currentImageIndex].src;
    lightboxImgElement.alt = galleryImgs[currentImageIndex].alt;

    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    lightboxImgElement.classList.remove('pannable', 'panning'); // Reset panning classes
    updateImageTransform(lightboxImgElement);
    updateZoomPercentage(zoomPercentageElement);
    lightboxElement.classList.add('active');
}

function moveImage(direction) {
    const galleryImages = document.querySelectorAll('.slideshow-container .slides img');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightbox = document.getElementById('lightbox');
    const zoomPercentage = document.getElementById('zoom-percentage');

    if (!galleryImages || galleryImages.length === 0 || !lightboxImg || !lightbox || !zoomPercentage) return;

    if (direction === 'left') {
        currentImageIndex--;
    } else if (direction === 'right') {
        currentImageIndex++;
    }

    if (currentImageIndex < 0) currentImageIndex = galleryImages.length - 1;
    else if (currentImageIndex >= galleryImages.length) currentImageIndex = 0;
    
    showImage(currentImageIndex, galleryImages, lightboxImg, lightbox, zoomPercentage);
}

function showQRInLightbox(img) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    lightboxImg.classList.remove('pannable', 'panning');
    updateImageTransform(lightboxImg);
    updateZoomPercentage(document.getElementById('zoom-percentage'));
}

function updateZoomPercentage(zoomPercentageElement) {
    if (zoomPercentageElement) {
        zoomPercentageElement.textContent = `${Math.round(currentZoom * 100)}%`;
    }
}

function updateImageTransform(lightboxImgElement) {
    if (lightboxImgElement) {
        lightboxImgElement.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    }
}

function zoomImage(direction) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    const lightboxImg = document.getElementById('lightbox-img');
    const zoomPercentage = document.getElementById('zoom-percentage');
    if (!lightboxImg || !zoomPercentage) return;

    const oldZoom = currentZoom;
    if (direction === 'in') {
        currentZoom += 0.1;
    } else if (direction === 'out' && currentZoom > 0.2) { // Min zoom slightly above 0.1 to avoid tiny image
        currentZoom -= 0.1;
    }
    currentZoom = Math.max(0.1, currentZoom); // Ensure zoom doesn't go too low or negative

    // If zooming out from a panned state to non-pannable, reset translation
    if (oldZoom > 1 && currentZoom <= 1) {
        translateX = 0;
        translateY = 0;
        lightboxImg.classList.remove('pannable', 'panning');
    } else if (currentZoom > 1) {
        lightboxImg.classList.add('pannable');
        lightboxImg.classList.remove('panning'); // Ensure not stuck in panning class
    } else {
         lightboxImg.classList.remove('pannable', 'panning');
    }

    updateImageTransform(lightboxImg);
    updateZoomPercentage(document.getElementById('zoom-percentage'));
}

function closeLightbox(lightboxElement) {
    if (lightboxElement) {
        lightboxElement.classList.remove('active');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightboxImg) { // Reset panning classes on close
            lightboxImg.classList.remove('pannable', 'panning');
        }
    }
}

document.addEventListener('keydown', (event) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        const panAmount = 20 / currentZoom; // Adjust pan amount based on zoom

        if (currentZoom > 1 && !isPanning) { // Allow keyboard pan only if not mouse panning
            let translated = false;
            switch (event.key) {
                case 'ArrowLeft': translateX -= panAmount; translated = true; break;
                case 'ArrowRight': translateX += panAmount; translated = true; break;
                case 'ArrowUp': translateY -= panAmount; translated = true; break;
                case 'ArrowDown': translateY += panAmount; translated = true; break;
            }
            if (translated) {
                updateImageTransform(document.getElementById('lightbox-img'));
                event.preventDefault();
            }
        }

        switch (event.key) {
            case 'Escape':
                closeLightbox(lightbox);
                break;
            case 'ArrowRight':
                if (currentZoom <= 1) {
                    moveImage('right');
                    event.preventDefault();
                }
                break;
            case 'ArrowLeft':
                if (currentZoom <= 1) {
                    moveImage('left');
                    event.preventDefault();
                }
                break;
            case '+':
            case '=':
                zoomImage('in');
                event.preventDefault();
                break;
            case '-':
                zoomImage('out');
                event.preventDefault();
                break;
        }
    }
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:8001/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const events = await response.json();
        let eventsSection = document.getElementById('events');
        if (!eventsSection) {
            const featuresSection = document.getElementById('features');
            if (!featuresSection) {
                console.log('Features section not found, skipping events section creation');
                return;
            }
            if (featuresSection.parentNode) {
                eventsSection = document.createElement('section');
                eventsSection.id = 'events';
                eventsSection.className = 'section';
                const title = document.createElement('h2');
                title.className = 'section-title';
                title.innerHTML = '<i class="fas fa-calendar"></i>Upcoming Events';
                eventsSection.appendChild(title);
                const eventsGridElement = document.createElement('div');
                eventsGridElement.className = 'features-grid';
                eventsGridElement.id = 'events-grid';
                eventsSection.appendChild(eventsGridElement);
                featuresSection.parentNode.insertBefore(eventsSection, featuresSection.nextSibling);
            } else {
                console.error("Features section not found, cannot append events section.");
                return;
            }
        }
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;
        eventsGrid.innerHTML = '';
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

function setupDonationForm() {
    const donateSection = document.getElementById('donation-form-container');
    if (!donateSection) {
        console.error("Donation section with ID 'donation-form-container' not found.");
        return;
    }
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
    donateSection.appendChild(donationForm);
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('donor-name').value;
        const email = document.getElementById('donor-email').value;
        const amount = document.getElementById('donation-amount').value;
        const purpose = document.getElementById('donation-purpose').value;
        try {
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, amount, purpose }),
            });
            if (!response.ok) throw new Error('Failed to process donation');
            // const result = await response.json(); // result not used
            alert('Thank you for your donation! May Lord Hanuman bless you.');
            donationForm.reset();
        } catch (error) {
            console.error('Error processing donation:', error);
            alert('There was an error processing your donation. Please try again later.');
        }
    });
}

function rotateAds() {
    const slides = document.querySelectorAll('.ad-slide');
    if (slides.length === 0) return;
    const activeSlideElement = document.querySelector('.ad-slide.active');
    if (!activeSlideElement) {
        if (slides.length > 0) slides[0].classList.add('active');
        return;
    }
    activeSlideElement.classList.remove('active');
    let nextSlideElement = activeSlideElement.nextElementSibling;
    if (!nextSlideElement || !nextSlideElement.classList.contains('ad-slide')) {
        nextSlideElement = slides[0];
    }
    if (nextSlideElement) nextSlideElement.classList.add('active');
}

// console.log('Ad slides:', document.querySelectorAll('.ad-slide')); // Keep for debugging if needed
const adSlidesForInterval = document.querySelectorAll('.ad-slide');
if (adSlidesForInterval.length > 0) {
    setInterval(rotateAds, 3000);
}

function showDonationDetails(type) { /* ... (original content) ... */ }
const apiUrl = 'http://localhost:8000/api/messages';

function showDonationQR(type) {
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qrImage');
    const qrTitle = document.getElementById('qrTitle');
    const closeModalButton = document.querySelector('#qrModal .close-modal');
    const qrSources = { 'railing': './images/QR.jpg', 'stairs': './images/QR.jpg', 'gaushala': './images/QR.jpg' };
    const titles = { 'railing': 'रेलिंग विकास के लिए दान', 'stairs': 'सीढ़ी विकास के लिए दान', 'gaushala': 'गौशाला के लिए दान' };

    if (qrSources[type] && titles[type] && qrImage && qrTitle && qrModal && closeModalButton) {
        qrImage.src = qrSources[type];
        qrTitle.textContent = titles[type];
        qrModal.style.display = 'block';
        closeModalButton.onclick = function() { qrModal.style.display = 'none'; };
        window.onclick = function(event) { if (event.target == qrModal) qrModal.style.display = 'none'; };
    } else {
        console.error('QR Modal elements not found or data missing for type:', type);
    }
}

function showSlides() {
    const adSlides = document.querySelectorAll('.ad-slide');
    let activeSlide = document.querySelector('.ad-slide.active');
    
    if (adSlides.length > 0) {
        if (!activeSlide) {
            adSlides[0].classList.add('active');
            return;
        }
        
        activeSlide.classList.remove('active');
        let nextSlide = activeSlide.nextElementSibling;
        
        if (!nextSlide || !nextSlide.classList.contains('ad-slide')) {
            nextSlide = adSlides[0];
        }
        
        nextSlide.classList.add('active');
    }
    const totalSlides = slides.length;
    const slidesToShow = 3; 

    if (slidesToShow <= 0) return; // Avoid division by zero or illogical behavior

    if (currentSlide >= totalSlides - (slidesToShow - 1) && totalSlides > slidesToShow) {
         currentSlide = 0; 
    } else if (totalSlides <= slidesToShow && currentSlide > 0) {
         currentSlide = 0;
    } else if (currentSlide < 0) { // Ensure currentSlide doesn't go negative
        currentSlide = 0;
    }

    for (let i = 0; i < totalSlides; i++) {
        slides[i].style.transform = `translateX(-${currentSlide * (100 / slidesToShow)}%)`;
    }
    currentSlide++;
}


function sendMessageToServer(message) {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    if (!message.trim()) return;
    addMessageToChat(message, 'sent');
    if(chatInput) chatInput.value = '';
    const loadingMessage = addMessageToChat('...', 'received loading');
    fetch('http://localhost:8001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        if(loadingMessage) removeMessageFromChat(loadingMessage);
        addMessageToChat(data.response, 'received');
    })
    .catch(error => {
        if(loadingMessage) removeMessageFromChat(loadingMessage);
        console.error('Error sending message:', error);
        addMessageToChat('Sorry, something went wrong. Please try again.', 'received');
    });
}

function addMessageToChat(text, type) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return null;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (type) type.split(' ').forEach(cls => messageElement.classList.add(cls));
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
}

function removeMessageFromChat(messageElement) {
    if (messageElement && messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
    }
}

/* Commented out blocks remain as in original */
/*
// This entire block is commented out as donateButtons and qrData are not defined globally
// and their intended functionality/initialization point is unclear.
// If this functionality is needed, donateButtons should be queried from the DOM
// (e.g., const donateButtons = document.querySelectorAll('.some-selector-for-donate-buttons');)
// and qrData should be defined, likely within the DOMContentLoaded listener.

console.log('donateButtons:', typeof donateButtons !== 'undefined' ? donateButtons : 'undefined');
console.log('qrData:', typeof qrData !== 'undefined' ? qrData : 'undefined');

if (typeof donateButtons !== 'undefined' && donateButtons) {
    donateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            if (typeof qrData !== 'undefined' && qrData && qrData[type]) {
                const data = qrData[type];
                const qrImage = document.getElementById('qrImage');
                const qrTitle = document.getElementById('qrTitle');
                const modal = document.getElementById('qrModal'); // Assuming 'modal' is the QR modal

                if(qrImage) qrImage.src = data.src;
                if(qrTitle) qrTitle.textContent = data.title;
                if(modal) modal.style.display = 'block';
            }
        });
    });
}
*/
/*
console.log('donateButtons:', typeof donateButtons !== 'undefined' ? donateButtons : 'undefined');
console.log('qrData:', typeof qrData !== 'undefined' ? qrData : 'undefined');
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
*/

// Add these functions after the showSlides function
function moveSlide(direction) {
    const slides = document.getElementsByClassName('slides');
    if (!slides || slides.length === 0) return;
    const totalSlides = slides.length;
    const slidesToShow = 3;
    
    if (direction === 'left') {
        currentSlide = Math.max(0, currentSlide - 2); // Go back 2 positions (1 for the auto-increment)
    } else {
        currentSlide = Math.min(totalSlides - slidesToShow + 1, currentSlide + 1);
    }
    
    for (let i = 0; i < totalSlides; i++) {
        slides[i].style.transform = `translateX(-${(currentSlide - 1) * (100 / slidesToShow)}%)`;
    }
}

// Add wheel event listener for zoomed image scrolling
if (lightboxImg) {
    lightboxImg.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUpOrLeave);
    lightboxImg.addEventListener('mouseleave', handleMouseUpOrLeave);
    
    // Add wheel event for zooming with mouse wheel
    lightboxImg.addEventListener('wheel', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        e.preventDefault(); // Prevent page scrolling
        
        if (e.deltaY < 0) {
            // Scroll up - zoom in
            zoomImage('in');
        } else {
            // Scroll down - zoom out
            zoomImage('out');
        }
    });
}

// Enhance the handleMouseMove function to improve panning
function handleMouseMove(e) {
    if (!isPanning) return;
    
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightboxImg) return;
    
    // Calculate the distance moved
    const moveX = (e.clientX - panStartX) / currentZoom;
    const moveY = (e.clientY - panStartY) / currentZoom;
    
    // Update translation values
    translateX = initialPanTranslateX + moveX;
    translateY = initialPanTranslateY + moveY;
    
    // Apply the transform
    updateImageTransform(lightboxImg);
}

// Enhance keyboard navigation for zoomed images
document.addEventListener('keydown', (event) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        // Adjust pan amount based on zoom level for smoother movement
        const panAmount = 20 / currentZoom;
        
        if (currentZoom > 1) {
            let translated = false;
            switch (event.key) {
                case 'ArrowLeft': translateX -= panAmount; translated = true; break;
                case 'ArrowRight': translateX += panAmount; translated = true; break;
                case 'ArrowUp': translateY -= panAmount; translated = true; break;
                case 'ArrowDown': translateY += panAmount; translated = true; break;
            }
            if (translated) {
                updateImageTransform(document.getElementById('lightbox-img'));
                event.preventDefault();
            }
        } else {
            // When not zoomed in, use arrow keys for navigation between images
            switch (event.key) {
                case 'ArrowRight':
                    moveImage('right');
                    event.preventDefault();
                    break;
                case 'ArrowLeft':
                    moveImage('left');
                    event.preventDefault();
                    break;
            }
        }
        
        // Additional keyboard shortcuts
        switch (event.key) {
            case 'Escape':
                closeLightbox(lightbox);
                break;
            case '+': case '=':
                zoomImage('in');
                event.preventDefault();
                break;
            case '-':
                zoomImage('out');
                event.preventDefault();
                break;
            case 'Home':
                // Reset zoom and position
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransform(document.getElementById('lightbox-img'));
                updateZoomPercentage(document.getElementById('zoom-percentage'));
                event.preventDefault();
                break;
        }
    }
});