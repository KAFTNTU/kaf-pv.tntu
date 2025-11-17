/*
================================================================
ГОЛОВНИЙ СКРИПТ САЙТУ (script.js)
================================================================
Версія 2.0 (Стабільна, без "лінивого завантаження")
Включає всі виправлення:
- Блюр модалок
- Фікс неону
- Фікс мобільного меню
- Фікс скролбару вкладок
- Прихований скролбар мобільного меню
================================================================
*/

// Чекаємо, поки вся HTML-сторінка завантажиться
document.addEventListener('DOMContentLoaded', function() {

    // --- 0. ГЛОБАЛЬНІ ЗМІННІ ---
    const htmlEl = document.documentElement; 
    const modalOverlay = document.getElementById('modal-overlay'); 
    let neonTimer = null; 
    const allModals = document.querySelectorAll('.modal-base');
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');

    // --- 1. ЛОГІКА МОБІЛЬНОГО МЕНЮ ("БУРГЕР") ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            
            // Блокуємо скрол, тільки якщо модалка НЕ відкрита
            const modalIsOpen = document.querySelector('.modal-base.modal-visible');
            if (!modalIsOpen) {
                 htmlEl.classList.toggle('modal-open', isOpen);
            }
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // --- 2. КНОПКА "НАГОРУ" ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        };
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 3. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ СКРОЛІ ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });
        revealElements.forEach(el => {
            observer.observe(el);
        });
    }

    // --- 4. КНОПКА "ПОКАЗАТИ ВСІХ" (у вкладці Персонал) ---
    const toggleStaffBtn = document.getElementById('toggle-staff-btn');
    const hiddenStaff = document.getElementById('hidden-staff');
    const toggleStaffText = document.getElementById('toggle-staff-text');
    const toggleStaffIcon = document.getElementById('toggle-staff-icon');

    if (toggleStaffBtn) {
        toggleStaffBtn.addEventListener('click', () => {
            const isHidden = hiddenStaff.classList.toggle('hidden');
            toggleStaffIcon.classList.toggle('rotate-180');
            if (isHidden) {
                toggleStaffText.textContent = 'Показати всіх';
            } else {
                toggleStaffText.textContent = 'Згорнути';
            }
        });
    }
    
    // --- 5. ЗАГАЛЬНА ЛОГІКА МОДАЛЬНИХ ВІКОН ---
    
    // 5.1. Функція ВІДКРИТТЯ модального вікна
    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            
            // Логіка блюру (v3 - фікс)
            const isTopModal = (modalId === 'staff-detail-modal' || modalId === 'small-news-modal');
            
            if (isTopModal) {
                modalOverlay.classList.add('modal-overlay-top'); // z-55
            } else {
                modalOverlay.classList.remove('modal-overlay-top');
            }

            modalOverlay.classList.remove('hidden');
            targetModal.classList.remove('hidden');
            
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                targetModal.classList.add('modal-visible');
            }, 10); 
            
            htmlEl.classList.add('modal-open');

            if (modalId === 'kafedra-modal') {
                resetKafedraTabs();
            }
        }
    }

    // 5.2. Функція ЗАКРИТТЯ модального вікна
    function closeModal(modal) {
        if (!modal) return;
        
        const isTopModal = (modal.id === 'staff-detail-modal' || modal.id === 'small-news-modal');

        modal.classList.remove('modal-visible');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            
            const anyModalStillVisible = document.querySelector('.modal-base.modal-visible');
            
            // Якщо це було ОСТАННЄ вікно
            if (!anyModalStillVisible && !mobileMenu.classList.contains('open')) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                    modalOverlay.classList.remove('modal-overlay-top');
                }, 300); 
            } 
            // Якщо ми закрили ВЕРХНЄ вікно, але нижнє ще відкрите
            else if (isTopModal && anyModalStillVisible) {
                 modalOverlay.classList.remove('modal-overlay-top');
            }
            
        }, 300); 
    }

    // 5.3. Налаштування кнопок закриття (хрестики)
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const modalToClose = e.target.closest('.modal-base');
            closeModal(modalToClose);
        });
    });

    // 5.4. Закриття по кліку на темний фон
    modalOverlay.addEventListener('click', () => {
        document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
             closeModal(modal);
        });
    });

    // 5.5. Закриття по клавіші "Escape"
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Шукаємо найвище вікно
            const topModal = document.querySelector('#staff-detail-modal.modal-visible') || document.querySelector('#small-news-modal.modal-visible');
            if (topModal) {
                closeModal(topModal); 
            } else {
                // Інакше закриваємо всі інші
                document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
                     closeModal(modal);
                });
            }
            
            // Закриваємо мобільне меню
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                menuOpenIcon.classList.remove('hidden');
                menuCloseIcon.classList.add('hidden');
                htmlEl.classList.remove('modal-open');
            }
        }
    });

    // --- 6. ЛОГІКА НАВІГАЦІЇ (Меню та Неон) ---
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            const modalId = this.dataset.modalId; 
            const targetId = this.dataset.targetId; 
            const tabTarget = this.dataset.tabTarget; 
            
            // A. Якщо це посилання ВІДКРИВАЄ МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); 
                e.stopPropagation(); 
                
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) {
                        closeModal(m);
                    }
                });

                openModal(modalId);
                
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        activateTab(targetModal, tabTarget);
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР
            else {
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
            }
            
            // C. Логіка НЕОНОВОЇ ПІДСВІТКИ
            if (targetId) {
                let targetTitle;
                
                if(modalId) {
                    const targetModal = document.getElementById(modalId);
                    if(targetModal) {
                         targetTitle = targetModal.querySelector('.section-title');
                    }
                } 
                else {
                    const targetSection = document.getElementById(targetId);
                    if(targetSection) {
                         targetTitle = targetSection.querySelector('.section-title');
                    } else if (targetId === 'hero-section') {
                         targetTitle = document.getElementById('hero-section').querySelector('.section-title');
                    }
                }

                if (targetTitle) {
                    if (neonTimer) clearTimeout(neonTimer); 
                    
                    document.querySelectorAll('.section-title-active').forEach(el => {
                        el.classList.remove('section-title-active');
                    });
                    
                    targetTitle.classList.add('section-title-active');
                    
                    neonTimer = setTimeout(() => {
                        targetTitle.classList.remove('section-title-active');
                    }, 1500); 
                }
            }

            // D. Закрити мобільне меню після кліку
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                
                // Фікс: Не закривати, якщо це кнопка випадаючого меню
                const isDropdownToggle = this.classList.contains('mobile-dropdown-toggle');

                if (!isDropdownToggle) { 
                    mobileMenu.classList.remove('open'); 
                    menuOpenIcon.classList.remove('hidden');
                    menuCloseIcon.classList.add('hidden');
                    
                    // Розблокувати скрол, ТІЛЬКИ ЯКЩО ми не відкрили модалку
                    if (!modalId) {
                         htmlEl.classList.remove('modal-open');
                    }
                }
            }
        });
    });

    // --- 7. ЛОГІКА СЛАЙДЕРА НОВИН ---
    const sliderContainer = document.getElementById('news-slider-container');
    const dotsContainer = document.getElementById('news-dots-container');
    
    if (sliderContainer && dotsContainer) {
        const slides = sliderContainer.querySelectorAll('.news-slide');
        const dots = [];
        const slidesPerView = window.innerWidth < 640 ? 1 : 2; 
        const totalDots = Math.ceil(slides.length / slidesPerView);

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'news-dot w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500';
            dot.setAttribute('aria-label', `Перейти до новини ${i + 1}`);
            dot.addEventListener('click', () => {
                const slideToScroll = slides[i * slidesPerView];
                if (slideToScroll) {
                    slideToScroll.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }

        const updateDots = () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const containerWidth = sliderContainer.clientWidth;
            let activeDotIndex = Math.round(scrollLeft / containerWidth);
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        };

        if (dots.length > 0) dots[0].classList.add('active'); 
        sliderContainer.addEventListener('scroll', updateDots, { passive: true });
    }

    // --- 8. ЛОГІКА "ЧИТАТИ ДАЛІ" (Маленьке вікно новин) ---
    document.querySelectorAll('.open-small-modal-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); 

            const smallModal = document.getElementById('small-news-modal');
            const modalDate = document.getElementById('small-news-date');
            const modalTitle = document.getElementById('small-news-title');
            const modalText = document.getElementById('small-news-modal-text');

            if (smallModal && modalDate && modalTitle && modalText) {
                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); 
                openModal('small-news-modal'); 
            }
        });
    });
    
    // --- 9. ЛОГІКА ВКЛАДОК (Tabs) ---
    function activateTab(modal, tabId) {
        const tabButtons = modal.querySelectorAll('.modal-tab');
        const tabContents = modal.querySelectorAll('.modal-tab-pane');
        
        const targetContent = document.getElementById(tabId);
        const targetButton = modal.querySelector(`.modal-tab[data-tab="${tabId}"]`);
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    function resetKafedraTabs() {
        const kafedraModal = document.getElementById('kafedra-modal');
        if (kafedraModal) {
            activateTab(kafedraModal, 'tab-history');
        }
    }
    
    const kafedraModal = document.getElementById('kafedra-modal');
    if (kafedraModal) {
        const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); 
                
                const targetTabId = button.dataset.tab; 
                const modalIdToOpen = button.dataset.modalId; 

                if (modalIdToOpen) {
                    openModal(modalIdToOpen);
                } else if (targetTabId) {
                    activateTab(kafedraModal, targetTabId);
                }
            });
        });
    }

    // --- 10. ЛОГІКА ВИПАДАЮЧИХ МЕНЮ (для мобільних) ---
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
                toggle.querySelector('svg').classList.toggle('rotate-180');
            }
        });
    });

    // --- 11. ЛОГІКА "ДЕТАЛІ ПРО ВИКЛАДАЧА" (з staff_data.js) ---
    const staffDetailModal = document.getElementById('staff-detail-modal');
    if (staffDetailModal) {
        const detailName = document.getElementById('staff-detail-name');
        const detailTitle = document.getElementById('staff-detail-title');
        const detailImg = document.getElementById('staff-detail-img');
        const detailDetails = document.getElementById('staff-detail-details');
        const detailLinks = document.getElementById('staff-detail-links');
        const detailDisciplines = document.getElementById('staff-detail-disciplines');
        const detailBio = document.getElementById('staff-detail-bio');

        document.querySelectorAll('.staff-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const staffId = card.dataset.staffId;
                
                if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                    const data = staffDetailsData[staffId];

                    detailName.textContent = data.name;
                    detailTitle.textContent = data.title;
                    detailImg.src = card.querySelector('img').src; 
                    detailImg.alt = `Фото ${data.name}`;
                    
                    detailDetails.innerHTML = data.details || '';
                    detailBio.innerHTML = data.bio || '<p>Біографічна довідка буде додана згодом.</p>';
                    
                    detailDisciplines.innerHTML = ''; 
                    if (data.disciplines && data.disciplines.length > 0) {
                        const ul = document.createElement('ul');
                        ul.className = 'list-disc pl-5 space-y-1';
                        data.disciplines.forEach(disc => {
                            const li = document.createElement('li');
                            li.textContent = disc;
                            ul.appendChild(li);
                        });
                        detailDisciplines.appendChild(ul);
                    } else {
                        detailDisciplines.innerHTML = '<li>Інформація про дисципліни відсутня.</li>';
                    }
                    
                    detailLinks.innerHTML = ''; 
                    if (data.links && data.links.length > 0) {
                         const ul = document.createElement('ul');
                         ul.className = 'list-none pl-0 space-y-1 link-list'; 
                         data.links.forEach(link => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                            a.className = 'text-sky-400 hover:text-sky-300 block truncate';
                            a.textContent = link.name;
                            li.appendChild(a);
                            ul.appendChild(li);
                        });
                        detailLinks.appendChild(ul);
                    } else {
                        const p = document.createElement('p');
                        p.className = 'text-sm text-slate-400';
                        p.textContent = 'Посилання відсутні.';
                        detailLinks.appendChild(p);
                    }

                    openModal('staff-detail-modal');
                    
                } else {
                    console.warn(`Дані для викладача з ID: ${staffId} не знайдені у staff_data.js`);
                    detailName.textContent = card.querySelector('h3').textContent || "Інформація відсутня";
                    detailTitle.textContent = card.querySelector('p').textContent || "";
                    detailImg.src = card.querySelector('img').src;
                    detailDetails.innerHTML = "<p>Детальна інформація про цього викладача буде додана незабаром.</p>";
                    detailLinks.innerHTML = '<p class="text-sm text-slate-400">Посилання відсутні.</p>';
                    detailDisciplines.innerHTML = '<li>Інформація про дисципліни відсутня.</li>';
                    detailBio.innerHTML = '<p>Біографічна довідка буде додана згодом.</p>';
                    
                    openModal('staff-detail-modal');
                }
            });
        });
    }

});
