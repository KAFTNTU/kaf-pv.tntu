/*
================================================================
ГОЛОВНИЙ СКРИПТ САЙТУ (script.js)
================================================================
Версія 3.1 (Виправлено "Гонку завантаження" (Race Condition))
- openModal тепер чекає, доки modals.html не завантажиться
================================================================
*/

document.addEventListener('DOMContentLoaded', function() {

    // --- 0. ГЛОБАЛЬНІ ЗМІННІ ---
    const htmlEl = document.documentElement; 
    const modalOverlay = document.getElementById('modal-overlay'); 
    let neonTimer = null; 

    // ОНОВЛЕНО: Створюємо "сигнал" (Promise), який повідомить, коли модалки завантажено
    let modalsLoadedPromise = new Promise((resolve, reject) => {
        // Ми "підмішаємо" resolve/reject у callback-функцію завантажувача
        document.body.addEventListener('modalsLoaded', () => resolve(true));
        document.body.addEventListener('modalsFailed', (e) => reject(e.detail));
    });
    
    // --- 1. ЛОГІКА ДИНАМІЧНОГО ЗАВАНТАЖЕННЯ (LAZY LOAD) ---
    
    /**
     * Асинхронно завантажує HTML-контент з файлу і вставляє його в контейнер.
     */
    async function loadDynamicContent(containerId, url, callback) {
        const targetContainer = document.getElementById(containerId);
        if (!targetContainer) {
            console.error(`Контейнер #${containerId} не знайдено.`);
            return;
        }

        // Якщо контент вже завантажено, просто викликаємо callback (якщо він є)
        if (targetContainer.dataset.loaded === 'true') {
            if (callback) callback(targetContainer);
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Помилка мережі: ${response.statusText}`);
            }
            const html = await response.text();
            
            targetContainer.innerHTML = html;
            targetContainer.dataset.loaded = 'true';
            
            // ОНОВЛЕНО: Посилаємо сигнал про успішне завантаження
            if (containerId === 'modal-container') {
                document.body.dispatchEvent(new Event('modalsLoaded'));
            }

            initializeRevealObserver(targetContainer);
            
            if (callback) callback(targetContainer);

        } catch (error) {
            console.error(`Помилка завантаження контенту для #${containerId} з ${url}:`, error);
            
            // ОНОВЛЕНО: Посилаємо сигнал про помилку
            if (containerId === 'modal-container') {
                // Передаємо деталі помилки
                document.body.dispatchEvent(new CustomEvent('modalsFailed', { detail: error }));
            }

            targetContainer.innerHTML = `<div class="p-6 text-center text-red-400">Помилка завантаження контенту. Будь ласка, спробуйте пізніше.</div>`;
        }
    }

    // 1.1. Завантажуємо ВЕСЬ вміст модальних вікон
    // Це теж робиться один раз при завантаженні сторінки
    loadDynamicContent('contacts-container', 'modal/contacts.html', () => {
        console.log('Секцію "Контакти" завантажено.');
    });


    // --- 2. ЛОГІКА МОБІЛЬНОГО МЕНЮ ("БУРГЕР") ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            const modalIsOpen = document.querySelector('.modal-base.modal-visible');
            if (!modalIsOpen) {
                 htmlEl.classList.toggle('modal-open', isOpen);
            }
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // --- 3. КНОПКА "НАГОРУ" ---
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

    // --- 4. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ СКРОЛІ ---
    function initializeRevealObserver(container) {
        const revealElements = container.querySelectorAll('.reveal');
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
    }
    // Запускаємо для контенту, що вже є на сторінці (Hero, Specialties)
    initializeRevealObserver(document.body);

    
    // --- 5. ЗАГАЛЬНА ЛОГІКА МОДАЛЬНИХ ВІКОН ---
    
    // 5.1. Функція ВІДКРИТТЯ модального вікна (ОНОВЛЕНО: стала async)
    async function openModal(modalId) {

        // ОНОВЛЕНО: Чекаємо, доки модалки не будуть завантажені
        try {
            await modalsLoadedPromise;
        } catch (error) {
            console.error("Не вдалося відкрити модальне вікно, оскільки вони не завантажились.", error);
            // Використовуємо кастомний бокс замість alert()
            showErrorModal("Помилка завантаження. Спробуйте оновити сторінку.");
            return;
        }

        // Тепер ми ВПЕВНЕНІ, що getElementById знайде вікно
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            
            const isTopModal = (modalId === 'staff-detail-modal' || modalId === 'small-news-modal');
            
            if (isTopModal) {
                modalOverlay.classList.add('modal-overlay-top');
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
            
            // Якщо це вікно новин, ініціалізуємо слайдер
            if (modalId === 'news-modal') {
                initializeNewsSlider(targetModal);
            }
        } else {
            console.error(`Модальне вікно з ID #${modalId} не знайдено, хоча modals.html мав бути завантажений.`);
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
            
            if (!anyModalStillVisible && !mobileMenu.classList.contains('open')) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                    modalOverlay.classList.remove('modal-overlay-top');
                }, 300); 
            } 
    // 5.5. Кастомне вікно помилок (замість alert)
    function showErrorModal(message) {
        let errorModal = document.getElementById('error-modal');
        if (!errorModal) {
            // Створюємо вікно, якщо його немає
            errorModal = document.createElement('div');
            errorModal.id = 'error-modal';
            errorModal.className = 'modal-base fixed inset-0 z-[99]'; // Найвищий z-index
            errorModal.innerHTML = `
                <div class="modal-content-container max-w-sm w-full neon-border-box">
                    <div class="modal-content-inner">
                        <div class="modal-header">
                            <h2 class="text-2xl font-bold text-red-400 section-title">Помилка</h2>
                            <button class="modal-close-btn" data-close-id="error-modal">
                                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div class="modal-scroll-content p-6">
                            <p class="text-slate-300" id="error-modal-text"></p>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(errorModal);
            
            // Навішуємо слухач на кнопку закриття
            errorModal.querySelector('.modal-close-btn').addEventListener('click', () => {
                closeModal(errorModal);
            });
        }
        
        document.getElementById('error-modal-text').textContent = message;
        openModal('error-modal');
    }


    // --- 6. ЛОГІКА НАВІГАЦІЇ (Меню та Неон) ---
    // Ця функція "слухає" кліки на всі посилання в хедері та мобільному меню
    function initializeNavLinks() {
        document.querySelectorAll('.nav-link-desktop, .nav-link-mobile').forEach(link => {
            link.addEventListener('click', function(e) {
                
                const modalId = this.dataset.modalId; 
                const targetId = this.dataset.targetId; 
                const tabTarget = this.dataset.tabTarget; 
                
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
                else {
                    document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
                }
                
                if (targetId) {
                    triggerNeon(modalId, targetId);
                }

                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    const isDropdownToggle = this.classList.contains('mobile-dropdown-toggle');
                    if (!isDropdownToggle) { 
                        mobileMenu.classList.remove('open'); 
                        menuOpenIcon.classList.remove('hidden');
                        menuCloseIcon.classList.add('hidden');
                        if (!modalId) {
                             htmlEl.classList.remove('modal-open');
                        }
                    }
                }
            });
        });
    }
    // Запускаємо слухачі для навігації
    initializeNavLinks();
    
    // Функція для неонового ефекту
    function triggerNeon(modalId, targetId) {
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

    // --- 7. ЛОГІКА МОБІЛЬНИХ ВИПАДАЮЧИХ МЕНЮ ---
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


    // --- 8. ФУНКЦІЇ, ЯКІ ЗАПУСКАЮТЬСЯ ПІСЛЯ ЗАВАНТАЖЕННЯ МОДАЛОК ---
    
    /**
     * Ця функція виконується ОДИН РАЗ після того, як 'modal/modals.html' завантажено.
     * Вона "навішує" всі необхідні слухачі на кнопки всередині модалок.
     */
    function initializeModalListeners() {
        
        // 8.1. Кнопки закриття (хрестики)
        document.querySelectorAll('.modal-close-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const modalToClose = e.target.closest('.modal-base');
                closeModal(modalToClose);
            });
        });

        // 8.2. Вкладки (Tabs)
        const kafedraModal = document.getElementById('kafedra-modal');
        if (kafedraModal) {
            const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    const targetTabId = button.dataset.tab; 
                    if (targetTabId) {
                        activateTab(kafedraModal, targetTabId);
                    }
                });
            });
        }
        
        // 8.3. Кнопка "Показати всіх" (Персонал)
        document.getElementById('modal-container').addEventListener('click', function(e) {
            const toggleBtn = e.target.closest('#toggle-staff-btn');
            if (toggleBtn) {
                const staffTab = toggleBtn.closest('#tab-staff');
                if (!staffTab) return;

                const hiddenStaff = staffTab.querySelector('#hidden-staff');
                const toggleStaffText = toggleBtn.querySelector('#toggle-staff-text');
                const toggleStaffIcon = toggleBtn.querySelector('#toggle-staff-icon');

                if (hiddenStaff && toggleStaffText && toggleStaffIcon) {
                    const isHidden = hiddenStaff.classList.toggle('hidden');
                    toggleStaffIcon.classList.toggle('rotate-180');
                    toggleStaffText.textContent = isHidden ? 'Показати всіх' : 'Згорнути';
                }
            }
        });
        
        // 8.4. Картки викладачів (Персонал)
        document.getElementById('modal-container').addEventListener('click', function(e) {
             const staffCard = e.target.closest('.staff-card');
             if (staffCard) {
                e.stopPropagation(); 
                activateStaffDetail(staffCard);
             }
        });

        // 8.5. Кнопки "Читати далі" (Новини)
        document.getElementById('modal-container').addEventListener('click', function(e) {
            const readMoreBtn = e.target.closest('.open-small-modal-btn');
            if (readMoreBtn) {
                e.preventDefault();
                e.stopPropagation(); 

                const smallModal = document.getElementById('small-news-modal');
                const modalDate = document.getElementById('small-news-date');
                const modalTitle = document.getElementById('small-news-title');
                const modalText = document.getElementById('small-news-modal-text');

                if (smallModal && modalDate && modalTitle && modalText) {
                    modalDate.textContent = readMoreBtn.dataset.date;
                    modalTitle.textContent = readMoreBtn.dataset.title;
                    modalText.textContent = readMoreBtn.dataset.text.replace(/\\n/g, '\n'); 
                    openModal('small-news-modal'); 
                }
            }
        });
        
    } // Кінець initializeModalListeners()


    // --- 9. ЛОГІКА ДЛЯ КОНКРЕТНИХ МОДАЛОК ---

    // 9.1. Слайдер новин
    function initializeNewsSlider(newsModal) {
        // Запобігаємо повторній ініціалізації
        if (newsModal.dataset.sliderInitialized === 'true') return;

        const sliderContainer = newsModal.querySelector('#news-slider-container');
        const dotsContainer = newsModal.querySelector('#news-dots-container');
        
        if (sliderContainer && dotsContainer) {
            const slides = sliderContainer.querySelectorAll('.news-slide');
            const dots = [];
            const slidesPerView = window.innerWidth < 640 ? 1 : 2; 
            const totalDots = Math.ceil(slides.length / slidesPerView);

            // Очищуємо старі крапки (про всяк випадок)
            dotsContainer.innerHTML = '';

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = 'news-dot w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500';
                dot.setAttribute('aria-label', `Перейти до новини ${i + 1}`);
                dot.addEventListener('click', () => {
                    const slideToScroll = slides[i * slidesPerView];
                    if (slideToScroll) {
                        sliderContainer.scrollTo({
                            left: slideToScroll.offsetLeft - sliderContainer.offsetLeft,
                            behavior: 'smooth'
                        });
                    }
                });
                dotsContainer.appendChild(dot);
                dots.push(dot);
            }

            const updateDots = () => {
                const scrollLeft = sliderContainer.scrollLeft;
                const slideWidth = slides[0].offsetWidth * slidesPerView;
                let activeDotIndex = Math.round(scrollLeft / slideWidth);
                
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeDotIndex);
                });
            };

            if (dots.length > 0) dots[0].classList.add('active'); 
            sliderContainer.addEventListener('scroll', updateDots, { passive: true });
            
            newsModal.dataset.sliderInitialized = 'true';
        }
    }
    
    // 9.2. Вкладки (Tabs)
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
            
            // Завантажуємо контент для вкладки, якщо його ще немає
            if (targetContent.dataset.contentUrl && !targetContent.dataset.loaded) {
                loadDynamicContent(tabId, targetContent.dataset.contentUrl);
            }
        }
    }

    function resetKafedraTabs() {
        const kafedraModal = document.getElementById('kafedra-modal');
        if (kafedraModal) {
            activateTab(kafedraModal, 'tab-history');
        }
    }
    
    // 9.3. Деталі про викладача
    function activateStaffDetail(card) {
        const staffDetailModal = document.getElementById('staff-detail-modal');
        if (!staffDetailModal) return;

        const detailName = document.getElementById('staff-detail-name');
        const detailTitle = document.getElementById('staff-detail-title');
        const detailImg = document.getElementById('staff-detail-img');
        const detailDetails = document.getElementById('staff-detail-details');
        const detailLinks = document.getElementById('staff-detail-links');
        const detailDisciplines = document.getElementById('staff-detail-disciplines');
        const detailBio = document.getElementById('staff-detail-bio');
        
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
    }

});
