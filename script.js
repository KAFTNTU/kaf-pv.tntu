document.addEventListener('DOMContentLoaded', function() {

    const htmlEl = document.documentElement; // Отримуємо <html>
    const modalOverlay = document.getElementById('modal-overlay'); // Єдиний фон

    // --- 1. Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // --- 2. Scroll to Top Button ---
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

    // --- 3. Animate on Scroll (Reveal) ---
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

    // --- 4. Staff Toggle (у модальному вікні) ---
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
    
    const allModals = document.querySelectorAll('.modal-base');
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile');
    
    // Функція відкриття модалки
    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (!targetModal) return;

        // Закрити ВСІ інші модалки
        allModals.forEach(m => {
            if (m.id !== modalId) {
                m.classList.remove('modal-visible');
                m.classList.add('hidden');
            }
        });
        
        // Відкрити потрібну
        modalOverlay.classList.remove('hidden');
        targetModal.classList.remove('hidden');
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            targetModal.classList.add('modal-visible');
        }, 10);
        htmlEl.classList.add('modal-open');
    }

    // Функція закриття ВСІХ модальних вікон
    function closeAllModals() {
        modalOverlay.style.opacity = '0';
        allModals.forEach(modal => {
            modal.classList.remove('modal-visible');
        });
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
            allModals.forEach(modal => {
                modal.classList.add('hidden');
            });
         }, 300); // 300ms - це час transition в CSS
        htmlEl.classList.remove('modal-open');
    }

    // Закриття по кнопці "хрестик"
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Якщо це кнопка на модалці 2-го рівня (z-60), закрити лише її
            const modal = e.target.closest('.modal-base');
            if (modal && modal.style.zIndex === '60') {
                modal.classList.remove('modal-visible');
                setTimeout(() => modal.classList.add('hidden'), 300);
            } else {
                // Інакше закрити всі
                closeAllModals();
            }
        });
    });

    // Закриття по кліку на фон (overlay)
    modalOverlay.addEventListener('click', closeAllModals);

    // Закриття по клавіші Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Знайти найвищу видиму модалку і закрити її
            const topModal = document.querySelector('.modal-base.modal-visible[style*="z-index: 60"]');
            if (topModal) {
                topModal.classList.remove('modal-visible');
                setTimeout(() => topModal.classList.add('hidden'), 300);
            } else {
                closeAllModals();
            }
        }
    });

    // --- 6. Логіка Навігації (Кліки по посиланнях) ---

    let neonTimer = null; // Таймер для неону

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            const modalId = this.dataset.modalId;
            const targetId = this.dataset.targetId; // ID секції або заголовка
            const tabTarget = this.dataset.tabTarget; // ID вкладки
            
            // A. Якщо це посилання відкриває МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); // Заборонити прокрутку
                openModal(modalId);
                
                // Якщо посилання також вказує на вкладку
                if (tabTarget) {
                    const modal = document.getElementById(modalId);
                    const targetTabButton = modal.querySelector(`.modal-tab[data-tab="${tabTarget}"]`);
                    if (targetTabButton) {
                        // Симулюємо клік по вкладці
                        targetTabButton.click();
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР
            else {
                closeAllModals(); // Закрити всі вікна
            }
            
            // C. Логіка Неонової Підсвітки Заголовка
            if (targetId) {
                let targetTitle;
                if(modalId) {
                    const targetModal = document.getElementById(modalId);
                    if(targetModal) {
                         targetTitle = targetModal.querySelector('.section-title');
                    }
                } else {
                    const targetSection = document.getElementById(targetId);
                    if(targetSection) {
                         targetTitle = targetSection.querySelector('.section-title');
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
                    }, 1500); // 1.5 секунди
                }
            }

            // D. Закрити мобільне меню після кліку
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.remove('hidden');
                menuCloseIcon.classList.add('hidden');
            }
        });
    });

    // --- 7. Логіка Слайдера Новин ---
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

    // --- 8. Логіка "Читати Далі" (Маленьке вікно новин) ---
    const openSmallModalButtons = document.querySelectorAll('.open-small-modal-btn');
    const smallModal = document.getElementById('small-news-modal');
    
    if (smallModal && openSmallModalButtons.length > 0) {
        const modalDate = document.getElementById('small-news-date');
        const modalTitle = document.getElementById('small-news-title');
        const modalText = document.getElementById('small-news-modal-text');

        openSmallModalButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); 
                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); 

                smallModal.classList.remove('hidden');
                setTimeout(() => {
                    smallModal.classList.add('modal-visible');
                }, 10);
            });
        });
    }
    
    // --- 9. Логіка Вкладок (Tabs) у модалці "Кафедра" ---
    const tabsContainer = document.querySelector('.modal-tabs-container');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.modal-tab');
        const tabContents = tabsContainer.closest('.modal-content-inner').querySelectorAll('.modal-tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTabId = button.dataset.tab;
                const modalId = button.dataset.modalId;

                // Якщо кнопка вкладки має відкрити ІНШУ модалку (напр. Персонал)
                if (modalId) {
                    openModal(modalId);
                    // Підсвітити заголовок
                    const targetTitle = document.getElementById(modalId)?.querySelector('.section-title');
                    if (targetTitle) {
                         if (neonTimer) clearTimeout(neonTimer);
                         document.querySelectorAll('.section-title-active').forEach(el => el.classList.remove('section-title-active'));
                         targetTitle.classList.add('section-title-active');
                         neonTimer = setTimeout(() => {
                             targetTitle.classList.remove('section-title-active');
                         }, 1500);
                    }
                } 
                // Якщо це звичайна вкладка
                else if (targetTabId) {
                    const targetContent = document.getElementById(targetTabId);
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    button.classList.add('active');
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                }
            });
        });
    }

    // --- 10. Логіка випадаючих меню (Dropdowns) для мобільних ---
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
            }
        });
    });
    
    // --- 11. НОВА ЛОГІКА: Детальне вікно викладача ---
    const staffDetailModal = document.getElementById('staff-detail-modal');
    
    // Перевірка, чи staff_data.js завантажився і чи є об'єкт
    if (staffDetailModal && typeof staffDetailsData !== 'undefined') {
        const staffCards = document.querySelectorAll('.staff-card');
        
        // Елементи всередині детального вікна
        const detailName = document.getElementById('staff-detail-name');
        const detailTitle = document.getElementById('staff-detail-title');
        const detailImg = document.getElementById('staff-detail-img');
        const detailDetails = document.getElementById('staff-detail-details');
        const detailLinks = document.getElementById('staff-detail-links');
        const detailDisciplines = document.getElementById('staff-detail-disciplines');
        const detailBio = document.getElementById('staff-detail-bio');

        staffCards.forEach(card => {
            card.addEventListener('click', () => {
                const staffId = card.dataset.staffId;
                const data = staffDetailsData[staffId];
                
                if (data) {
                    // 1. Заповнити даними
                    detailName.textContent = data.name;
                    detailTitle.textContent = data.title;
                    detailImg.src = card.querySelector('img').src; // Беремо фото з картки
                    
                    detailDetails.innerHTML = data.details || '';
                    detailBio.innerHTML = data.bio || '<h3>Біографічна довідка</h3><p>Інформація додається...</p>';
                    
                    // Заповнити дисципліни
                    detailDisciplines.innerHTML = ''; // Очистити
                    if (data.disciplines && data.disciplines.length > 0) {
                        data.disciplines.forEach(disc => {
                            const li = document.createElement('li');
                            li.textContent = disc;
                            detailDisciplines.appendChild(li);
                        });
                    } else {
                        detailDisciplines.innerHTML = '<li>Інформація додається...</li>';
                    }
                    
                    // Заповнити посилання
                    detailLinks.innerHTML = ''; // Очистити
                    if (data.links && data.links.length > 0) {
                        data.links.forEach(link => {
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.name;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                            detailLinks.appendChild(a);
                        });
                    }
                    
                    // 2. Відкрити модалку (вона має бути поверх)
                    staffDetailModal.classList.remove('hidden');
                    setTimeout(() => {
                        staffDetailModal.classList.add('modal-visible');
                    }, 10);
                    // НЕ блокуємо htmlEl, бо він вже заблокований
                }
            });
        });
    } else if (!staffDetailModal) {
        console.error("Елемент #staff-detail-modal не знайдено в index.html");
    } else {
        console.error("Файл staff_data.js не завантажено або об'єкт staffDetailsData не знайдено.");
    }

});
