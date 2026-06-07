/* 
   ==========================================================================
   9 SQUARE INFRA - CLIENT LOGIC & DYNAMICS
   ==========================================================================
   Description: Orchestrating premium architectural visual interactive systems,
                mathematical calculation models, and immersive modal players.
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAVBAR GLOW ON SCROLL ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- MOBILE HAMBURGER MENU ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Set active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // --- HERO TYPEWRITER EFFECT ---
    const typewriterElement = document.getElementById('typewriter');
    const phrases = ["3D Elevations", "Interior Designs", "3D Room Designs", "3D Walkthroughs"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function handleTypewriter() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deletes faster
        } else {
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at complete word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing next word
        }

        setTimeout(handleTypewriter, typingSpeed);
    }

    handleTypewriter();

    // --- INTERACTIVE 9 SQUARE CARD FLIPS FOR MOBILE ---
    // On desktops, CSS hover handles flips. On touch devices, click triggers flips.
    const sqCards = document.querySelectorAll('.sq-card:not(.core-square)');
    sqCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if card is already flipped
            const isFlipped = card.classList.contains('flipped');
            
            // Reset all cards
            sqCards.forEach(c => c.classList.remove('flipped'));
            
            if (!isFlipped) {
                card.classList.add('flipped');
            }
        });
    });

    // --- INTERIORS 3D PLANS - ROOM SELECTOR ---
    const roomTabs = document.querySelectorAll('.room-tab');
    const roomImage = document.getElementById('roomImage');
    const roomTitle = document.getElementById('roomTitle');
    const roomDesc = document.getElementById('roomDesc');

    const roomData = {
        living: {
            title: "Luxury Living Room Plan",
            desc: "Includes an expansive layout containing premium seating spaces, custom entertainment units, floor-to-ceiling glass patio connectivity, and detailed zoning for architectural light pathways.",
            image: "assets/images/plan_living.png"
        },
        bedroom: {
            title: "Premium Master Bedroom Plan",
            desc: "Highlights optimized closet wall alignments, cozy bedroom lounge positioning, architectural direct/indirect ambient ceiling slots, and dynamic bed-facing sightlines.",
            image: "assets/images/plan_bedroom.png"
        },
        kitchen: {
            title: "Ultra-Modern Modular Kitchen Plan",
            desc: "Features an ergonomically aligned work triangle (sink, hob, fridge), a luxury central preparation island with custom marble bar counters, and hidden sleek pantry units.",
            image: "assets/images/plan_kitchen.png"
        }
    };

    roomTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const roomKey = tab.getAttribute('data-room');
            
            // Toggle Active Tab class
            roomTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Fluid Transition on details & image swap
            roomImage.style.opacity = 0;
            roomImage.style.transform = "scale(0.96) rotate(-2deg)";
            
            setTimeout(() => {
                roomImage.src = roomData[roomKey].image;
                roomTitle.textContent = roomData[roomKey].title;
                roomDesc.textContent = roomData[roomKey].desc;
                
                roomImage.style.opacity = 1;
                roomImage.style.transform = "scale(1) rotate(0)";
            }, 300);
        });
    });

    // --- 3D ELEVATIONS - DAY-TO-NIGHT TWILIGHT SLIDER ---
    const sliderContainer = document.getElementById('sliderContainer');
    const nightImagePane = document.getElementById('nightImagePane');
    const sliderDivider = document.getElementById('sliderDivider');
    let isDragging = false;

    function moveSlider(clientX) {
        const containerRect = sliderContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        let relativeX = clientX - containerRect.left;
        
        // Safety bounds
        if (relativeX < 0) relativeX = 0;
        if (relativeX > containerWidth) relativeX = containerWidth;
        
        // Convert to percentage
        const percent = (relativeX / containerWidth) * 100;
        
        // Update clipping layout
        // In the HTML, the night image overlaps, so width controls the split boundary
        nightImagePane.style.width = `${100 - percent}%`;
        sliderDivider.style.left = `${percent}%`;
    }

    // Event listeners for dragging
    sliderContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        moveSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Mobile Touch Gesture Support
    sliderContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        if (e.touches[0]) {
            moveSlider(e.touches[0].clientX);
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches[0]) {
            moveSlider(e.touches[0].clientX);
        }
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // --- 3D DESIGNS - ROOM STYLE CONFIGURATOR ---
    const styleOptions = document.querySelectorAll('.style-opt');
    const styleImage = document.getElementById('styleImage');
    const styleDesc = document.getElementById('styleDesc');

    const styleData = {
        modern: {
            desc: "<strong>Modern Luxury Theme:</strong> Features deep emerald green custom velvet trims, detailed luxury gold/brass profiles, and premium polished white marble tiling with deep grey veins.",
            image: "assets/images/style_modern.png"
        },
        scandi: {
            desc: "<strong>Scandinavian Minimalist:</strong> Emphasizes light Scandinavian oak timber coatings, textured warm cream-colored linen fibers, cozy houseplants, and clean, natural bright light exposures.",
            image: "assets/images/style_scandi.png"
        },
        industrial: {
            desc: "<strong>Industrial Sleek:</strong> Highlights raw, hand-plastered grey concrete textured walls, exposed dark brick structures, black iron frameworks, and glowing hanging filament bulbs.",
            image: "assets/images/style_industrial.png"
        }
    };

    styleOptions.forEach(option => {
        option.addEventListener('click', () => {
            const styleKey = option.getAttribute('data-style');
            
            // Toggle active option class
            styleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Transition swap visual images
            styleImage.style.opacity = 0;
            styleImage.style.transform = "scale(1.05) translateY(-5px)";
            
            setTimeout(() => {
                styleImage.src = styleData[styleKey].image;
                styleDesc.innerHTML = styleData[styleKey].desc;
                
                styleImage.style.opacity = 1;
                styleImage.style.transform = "scale(1) translateY(0)";
            }, 300);
        });
    });

    // --- PLAN APPROVALS - PLAN TOGGLE ---
    const planTabs = document.querySelectorAll('.plan-tab');
    const planImage = document.getElementById('planImage');
    const planTitle = document.getElementById('planTitle');
    const planDesc = document.getElementById('planDesc');

    const planData = {
        draft: {
            title: "Standard 2D Floor Plan Draft",
            desc: "High-accuracy dimensional grid drafts showcasing room measurements, door/window openings, wall thicknesses, and furniture layouts.",
            image: "assets/images/plan_2d.png"
        },
        approval: {
            title: "Official Plan Approval Sanction",
            desc: "Municipal-ready blueprint sheets complete with site plans, key maps, structural specifications, and zoning compliance layouts.",
            image: "assets/images/plan_approvals.png"
        }
    };

    planTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const planKey = tab.getAttribute('data-plan');
            
            // Toggle Active Tab class
            planTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Fluid Transition on details & image swap
            planImage.style.opacity = 0;
            planImage.style.transform = "scale(0.96) rotate(1deg)";
            
            setTimeout(() => {
                planImage.src = planData[planKey].image;
                planTitle.textContent = planData[planKey].title;
                planDesc.textContent = planData[planKey].desc;
                
                planImage.style.opacity = 1;
                planImage.style.transform = "scale(1) rotate(0)";
            }, 300);
        });
    });

    // --- VR WALKTHROUGH MEDIA SIMULATION POPUP ---
    const videoTrigger = document.getElementById('videoTrigger');
    const videoModal = document.getElementById('videoModal');
    const modalClose = document.getElementById('modalClose');
    const simPlayBtn = document.getElementById('simPlayBtn');
    const simScreen = document.getElementById('simScreen');
    
    const ctrlPlay = document.getElementById('ctrlPlay');
    const ctrlSceneSwap = document.getElementById('ctrlSceneSwap');
    const timelineFill = document.getElementById('timelineFill');
    const timeReadout = document.getElementById('timeReadout');
    
    const simScenes = document.querySelectorAll('.sim-scene');
    
    let isPlaying = false;
    let simTimer = null;
    let currentSceneIdx = 0;
    let currentDuration = 0; // seconds
    const totalDuration = 15;

    // Modal Triggers
    videoTrigger.addEventListener('click', () => {
        videoModal.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
        videoModal.classList.remove('active');
        pauseWalkthrough();
    });

    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.classList.remove('active');
            pauseWalkthrough();
        }
    });

    // Play/Pause Core Actions
    function startWalkthrough() {
        isPlaying = true;
        simPlayBtn.style.opacity = 0;
        simPlayBtn.style.pointerEvents = 'none';
        ctrlPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        // Zoom-in moving camera simulated effect
        simScenes[currentSceneIdx].classList.add('playing');
        
        simTimer = setInterval(() => {
            currentDuration += 0.1;
            
            // Sync timeline fill
            const pct = (currentDuration / totalDuration) * 100;
            timelineFill.style.width = `${pct}%`;
            
            // Sync timer clock
            const secs = Math.floor(currentDuration);
            timeReadout.textContent = `0:${secs < 10 ? '0' : ''}${secs} / 0:15`;
            
            // Auto swap scenes every 5 seconds
            if (secs > 0 && secs % 5 === 0 && Math.abs(currentDuration - secs) < 0.05) {
                nextWalkthroughScene();
            }
            
            // Completed play paths
            if (currentDuration >= totalDuration) {
                pauseWalkthrough();
                resetWalkthrough();
            }
        }, 100);
    }

    function pauseWalkthrough() {
        isPlaying = false;
        simPlayBtn.style.opacity = 1;
        simPlayBtn.style.pointerEvents = 'auto';
        ctrlPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearInterval(simTimer);
        
        // Halt zooms
        simScenes.forEach(sc => sc.classList.remove('playing'));
    }

    function resetWalkthrough() {
        currentDuration = 0;
        currentSceneIdx = 0;
        timelineFill.style.width = '0%';
        timeReadout.textContent = '0:00 / 0:15';
        
        simScenes.forEach((sc, idx) => {
            sc.classList.remove('active', 'playing');
            if (idx === 0) sc.classList.add('active');
        });
    }

    function nextWalkthroughScene() {
        simScenes[currentSceneIdx].classList.remove('active', 'playing');
        
        currentSceneIdx = (currentSceneIdx + 1) % simScenes.length;
        simScenes[currentSceneIdx].classList.add('active');
        
        if (isPlaying) {
            simScenes[currentSceneIdx].classList.add('playing');
        }
    }

    simScreen.addEventListener('click', () => {
        if (!isPlaying) {
            startWalkthrough();
        } else {
            pauseWalkthrough();
        }
    });

    ctrlPlay.addEventListener('click', () => {
        if (!isPlaying) {
            startWalkthrough();
        } else {
            pauseWalkthrough();
        }
    });

    ctrlSceneSwap.addEventListener('click', nextWalkthroughScene);

    // --- FORM VALIDATION & HIGH-END CONSULTATION SUCCESS MODAL ---
    const consultForm = document.getElementById('consultationForm');
    const clientName = document.getElementById('clientName');
    const clientPhone = document.getElementById('clientPhone');
    const clientEmail = document.getElementById('clientEmail');
    const projectTypeSelect = document.getElementById('projectType');
    const projectServiceSelect = document.getElementById('projectService');
    const projectRequirementsTextarea = document.getElementById('projectRequirements');
    
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');
    const serviceError = document.getElementById('serviceError');
    
    const successModal = document.getElementById('successModal');
    const successMessage = document.getElementById('successMessage');
    const successCloseBtn = document.getElementById('successCloseBtn');
    
    const summaryProp = document.getElementById('summaryProp');
    const summaryService = document.getElementById('summaryService');

    // Validation patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[0-9\s-]{9,15}$/;

    function validateField(input, errorElement, validationFn) {
        const parent = input.closest('.form-group');
        const isValid = validationFn(input.value.trim());
        
        if (!isValid) {
            parent.classList.add('invalid');
        } else {
            parent.classList.remove('invalid');
        }
        
        return isValid;
    }

    // Live validation triggers
    clientName.addEventListener('blur', () => {
        validateField(clientName, nameError, val => val.length > 0);
    });

    clientPhone.addEventListener('blur', () => {
        validateField(clientPhone, phoneError, val => phoneRegex.test(val));
    });

    clientEmail.addEventListener('blur', () => {
        validateField(clientEmail, emailError, val => emailRegex.test(val));
    });

    projectServiceSelect.addEventListener('change', () => {
        validateField(projectServiceSelect, serviceError, val => val !== "");
    });

    consultForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Run general forms audit
        const isNameValid = validateField(clientName, nameError, val => val.length > 0);
        const isPhoneValid = validateField(clientPhone, phoneError, val => phoneRegex.test(val));
        const isEmailValid = validateField(clientEmail, emailError, val => emailRegex.test(val));
        const isServiceValid = validateField(projectServiceSelect, serviceError, val => val !== "");

        if (isNameValid && isPhoneValid && isEmailValid && isServiceValid) {
            // Populate success screen services summary
            summaryProp.textContent = projectTypeSelect.options[projectTypeSelect.selectedIndex].text;
            summaryService.textContent = projectServiceSelect.options[projectServiceSelect.selectedIndex].text;
            
            // Format success custom message
            const firstName = clientName.value.trim().split(' ')[0];
            successMessage.innerHTML = `Thank you, <strong>${firstName}</strong>. Our lead structural visualization engineer will contact you on <strong>${clientPhone.value.trim()}</strong> within the next 12-24 hours with custom design options.`;
            
            // Open Success Screen Modal
            successModal.classList.add('active');
            
            // WhatsApp Click to Chat Redirection
            const primaryNumber = "919948699399";
            let messageText = `*New Inquiry - 9 Square Infra*\n\n`;
            messageText += `*Client Name:* ${clientName.value.trim()}\n`;
            messageText += `*Phone:* ${clientPhone.value.trim()}\n`;
            messageText += `*Email:* ${clientEmail.value.trim()}\n`;
            messageText += `*Property Category:* ${projectTypeSelect.options[projectTypeSelect.selectedIndex].text}\n`;
            messageText += `*Service Requested:* ${projectServiceSelect.options[projectServiceSelect.selectedIndex].text}\n\n`;
            
            if (projectRequirementsTextarea.value.trim()) {
                messageText += `*Requirements / Notes:*\n${projectRequirementsTextarea.value.trim()}\n`;
            }
            
            const whatsAppUrl = `https://wa.me/${primaryNumber}?text=${encodeURIComponent(messageText)}`;
            
            // Google Sheets Integration
            const googleSheetUrl = ""; // TODO: Paste your Google Apps Script Web App URL here
            
            if (googleSheetUrl && googleSheetUrl !== "") {
                const sheetData = {
                    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    name: clientName.value.trim(),
                    phone: clientPhone.value.trim(),
                    email: clientEmail.value.trim(),
                    category: projectTypeSelect.options[projectTypeSelect.selectedIndex].text,
                    requirements: `Service: ${projectServiceSelect.options[projectServiceSelect.selectedIndex].text}\nNotes: ${projectRequirementsTextarea.value.trim()}`,
                    budget: 'N/A'
                };
                
                fetch(googleSheetUrl, {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(sheetData)
                }).catch(err => console.error("Google Sheets save error:", err));
            }
            
            window.open(whatsAppUrl, '_blank');
            
            // Clear all fields
            consultForm.reset();
            document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));
        }
    });

    successCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    // Close on outer container clicks
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });
});
