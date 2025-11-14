/*
================================================================
ГОЛОВНИЙ СКРИПТ САЙТУ (script.js)
================================================================
Тут знаходиться вся інтерактивна логіка:
- Відкриття/закриття модальних вікон
- Перемикання вкладок (tabs)
- Мобільне меню
- Слайдер новин
- Логіка "Читати далі"
- Логіка "Деталі про викладача"
- Анімації (неон, скрол)
================================================================
*/

// Чекаємо, поки вся HTML-сторінка завантажиться
document.addEventListener('DOMContentLoaded', function() {

    // --- 0. ГЛОБАЛЬНІ ЗМІННІ ---
    // Отримуємо доступ до <html>, щоб блокувати прокрутку
    const htmlEl = document.documentElement; 
    // Отримуємо доступ до ОДНОГО фону, який буде спільним для всіх вікон
    const modalOverlay = document.getElementById('modal-overlay'); 
    // Таймер для неонової підсвітки заголовків
    let neonTimer = null; 
    // Всі модальні вікна на сторінці
    const allModals = document.querySelectorAll('.modal-base');
    // Всі посилання в навігації (для комп'ютерів, мобільних та випадаючих меню)
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');


    // --- 1. ЛОГІКА МОБІЛЬНОГО МЕНЮ ("БУРГЕР") ---
    // Цей код відповідає за кнопку-хрестик (відкрити/закрити)
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

    // --- 2. КНОПКА "НАГОРУ" ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        // Показати/приховати кнопку
        window.onscroll = function() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        };
        // Прокрутити нагору при кліку
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 3. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ СКРОЛІ ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        // Створюємо "спостерігача", який стежить за появою елементів
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Коли елемент з'являється на екрані
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1 // Спрацювати, коли видно 10% елемента
        });
        // "Спостерігати" за кожним елементом
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
            // 1. Показати темний фон
            modalOverlay.classList.remove('hidden');
            // 2. Показати вікно (воно ще прозоре)
            targetModal.classList.remove('hidden');
            
            // 3. Зробити фон і вікно видимими (це запускає CSS анімацію)
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                targetModal.classList.add('modal-visible');
            }, 10); // Маленька затримка для плавності
            
            // 4. Заблокувати прокрутку сторінки позаду
            htmlEl.classList.add('modal-open');

            // 5. Якщо це вікно "Кафедра", скинути його на вкладку "Історія"
            // (Виправлено, щоб не конфліктувати з вибором вкладки)
            // if (modalId === 'kafedra-modal') {
            //     resetKafedraTabs();
            // }
        }
    }

    // 5.2. Функція ЗАКРИТТЯ модального вікна
    function closeModal(modal) {
        if (!modal) return;
        
        // 1. Зробити вікно прозорим
        modal.classList.remove('modal-visible');
        
        // 2. Зачекати 300ms (час анімації), перш ніж приховати його
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // 3. Перевірити, чи залишились ще *інші* відкриті вікна
            const anyModalStillVisible = document.querySelector('.modal-base.modal-visible');
            
            // 4. Якщо це було ОСТАННЄ вікно - приховати фон і розблокувати скрол
            if (!anyModalStillVisible) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                }, 300); // Чекаємо анімацію фону
            }
            
        }, 300); 
    }

    // 5.3. Налаштування кнопок закриття (хрестики)
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Знайти найближче вікно і закрити його
            const modalToClose = e.target.closest('.modal-base');
            closeModal(modalToClose);
        });
    });

    // 5.4. Закриття по кліку на темний фон
    modalOverlay.addEventListener('click', () => {
        // Закрити всі відкриті вікна
        document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
             closeModal(modal);
        });
    });

    // 5.5. Закриття по клавіші "Escape"
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Шукаємо найвище вікно (деталі про викладача)
            const topModal = document.querySelector('#staff-detail-modal.modal-visible');
            if (topModal) {
                closeModal(topModal); // Закриваємо тільки його
            } else {
                // Інакше закриваємо всі інші
                document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
                     closeModal(modal);
                });
            }
        }
    });

    // --- 6. ЛОГІКА НАВІГАЦІЇ (Меню та Неон) ---
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            const modalId = this.dataset.modalId; // Яке вікно відкрити?
            const targetId = this.dataset.targetId; // Який заголовок підсвітити?
            const tabTarget = this.dataset.tabTarget; // Яку вкладку активувати?
            
            // A. Якщо це посилання ВІДКРИВАЄ МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); // Не переходити по посиланню
                e.stopPropagation(); // Не дати кліку "провалитися" на фон
                
                // Закрити всі інші вікна (якщо вони є)
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) {
                        closeModal(m);
                    }
                });

                // Відкрити наше вікно
                openModal(modalId);
                
                // **ВИПРАВЛЕННЯ ТУТ:**
                // Активувати потрібну вкладку (якщо ми натиснули "Освітні програми")
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        // Ми активуємо вкладку ПІСЛЯ того, як вікно відкрилося
                        activateTab(targetModal, tabTarget);
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР (наприклад, "Спеціальності")
            else {
                // Просто закрити всі вікна
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
            }
            
            // C. Логіка НЕОНОВОЇ ПІДСВІТКИ заголовка
            if (targetId) {
                let targetTitle;
                
                // Якщо це модалка, шукаємо заголовок всередині неї
                if(modalId) {
                    const targetModal = document.getElementById(modalId);
                    if(targetModal) {
                         targetTitle = targetModal.querySelector('.section-title');
                    }
                } 
                // Якщо це якір, шукаємо на сторінці
                else {
                    const targetSection = document.getElementById(targetId);
                    if(targetSection) {
                         targetTitle = targetSection.querySelector('.section-title');
                    } else if (targetId === 'hero-section') {
                         targetTitle = document.getElementById('hero-section').querySelector('.section-title');
                    }
                }

                // Запускаємо неон
                if (targetTitle) {
                    if (neonTimer) clearTimeout(neonTimer); // Скинути старий таймер
                    
                    // Зняти підсвітку з інших
                    document.querySelectorAll('.section-title-active').forEach(el => {
                        el.classList.remove('section-title-active');
                    });
                    
                    // Увімкнути
                    targetTitle.classList.add('section-title-active');
                    
                    // Вимкнути через 1.5 секунди
                    neonTimer = setTimeout(() => {
                        targetTitle.classList.remove('section-title-active');
                    }, 1500); 
                }
            }

            // D. Закрити мобільне меню після кліку
            // !!! ВИПРАВЛЕННЯ: Я видалив цей блок коду на ваше прохання !!!
            // Тепер меню буде закриватися ТІЛЬКИ по "хрестику"
            /*
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.remove('hidden');
                menuCloseIcon.classList.add('hidden');
            }
            */
        });
    });

    // --- 7. ЛОГІКА СЛАЙДЕРА НОВИН ---
    const sliderContainer = document.getElementById('news-slider-container');
    const dotsContainer = document.getElementById('news-dots-container');
    
    if (sliderContainer && dotsContainer) {
        const slides = sliderContainer.querySelectorAll('.news-slide');
        const dots = [];
        // Визначаємо, скільки слайдів видно (1 на моб, 2 на ПК)
        const slidesPerView = window.innerWidth < 640 ? 1 : 2; 
        const totalDots = Math.ceil(slides.length / slidesPerView);

        // Створюємо "горошинки"
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'news-dot w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500';
            dot.setAttribute('aria-label', `Перейти до новини ${i + 1}`);
            dot.addEventListener('click', () => {
                // Прокрутити до потрібного набору слайдів
                const slideToScroll = slides[i * slidesPerView];
                if (slideToScroll) {
                    slideToScroll.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }

        // Функція, що оновлює активну "горошинку"
        const updateDots = () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const containerWidth = sliderContainer.clientWidth;
            let activeDotIndex = Math.round(scrollLeft / containerWidth);
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        };

        if (dots.length > 0) dots[0].classList.add('active'); // Перша активна
        sliderContainer.addEventListener('scroll', updateDots, { passive: true });
    }

    // --- 8. ЛОГІКА "ЧИТАТИ ДАЛІ" (Маленьке вікно новин) ---
    const openSmallModalButtons = document.querySelectorAll('.open-small-modal-btn');
    const smallModal = document.getElementById('small-news-modal');
    
    if (smallModal && openSmallModalButtons.length > 0) {
        // Знаходимо елементи маленького вікна
        const modalDate = document.getElementById('small-news-date');
        const modalTitle = document.getElementById('small-news-title');
        const modalText = document.getElementById('small-news-modal-text');

        openSmallModalButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Не закривати велике вікно

                // Заповнюємо даними з кнопки
                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); 

                openModal('small-news-modal'); // Використовуємо нашу функцію
            });
        });
    }
    
    // --- 9. ЛОГІКА ВКЛАДОК (Tabs) у модалці "Кафедра" (ВИПРАВЛЕНО) ---
    
    // 9.1. Функція для активації вкладки
    function activateTab(modal, tabId) {
        if (!modal) return;
        
        const tabButtons = modal.querySelectorAll('.modal-tab');
        const tabContents = modal.querySelectorAll('.modal-tab-pane');
        const targetContent = document.getElementById(tabId);
        const targetButton = modal.querySelector(`.modal-tab[data-tab="${tabId}"]`);
        
        // Деактивувати всі
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Активувати потрібні
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
    }

    // 9.2. Функція для скидання вкладок до "Історії"
    function resetKafedraTabs() {
        const kafedraModal = document.getElementById('kafedra-modal');
        if (kafedraModal) {
            activateTab(kafedraModal, 'tab-history');
        }
    }

    // 9.3. Навішуємо слухачі на кнопки вкладок
    const kafedraModal = document.getElementById('kafedra-modal');
    if (kafedraModal) {
        const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // !! ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку
                
                const targetTabId = button.dataset.tab; // Яку вкладку відкрити

                // Звичайна логіка перемикання вкладок
                if (targetTabId) {
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
            e.stopPropagation(); // !! ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
                toggle.querySelector('svg').classList.toggle('rotate-180');
            }
        });
    });

    // --- 11. ЛОГІКА "ДЕТАЛІ ПРО ВИКЛАДАЧА" (з staff_data.js) ---
    // (Переконайтеся, що файл staff_data.js підключено у index.html ПЕРЕД цим скриптом)
    const staffDetailModal = document.getElementById('staff-detail-modal');
    if (staffDetailModal) {
        // Знаходимо елементи у вікні деталей
        const detailName = document.getElementById('staff-detail-name');
        const detailTitle = document.getElementById('staff-detail-title');
        const detailImg = document.getElementById('staff-detail-img');
        const detailDetails = document.getElementById('staff-detail-details');
        const detailLinks = document.getElementById('staff-detail-links');
        const detailDisciplines = document.getElementById('staff-detail-disciplines');
        const detailBio = document.getElementById('staff-detail-bio');

        // "Слухаємо" кліки на всі картки викладачів
        document.querySelectorAll('.staff-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation(); // Не закривати вікно "Кафедра"
                const staffId = card.dataset.staffId;
                
                // Перевіряємо, чи є файл staff_data.js і чи є в ньому цей викладач
                if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                    const data = staffDetailsData[staffId];

                    // 1. Заповнюємо базові дані
                    detailName.textContent = data.name;
                    detailTitle.textContent = data.title;
                    detailImg.src = card.querySelector('img').src; 
                    detailImg.alt = `Фото ${data.name}`;
                    
                    // 2. Заповнюємо деталі (Посада, ступінь, звання)
                    detailDetails.innerHTML = data.details || '';
                    
                    // 3. Заповнюємо біографію
                    detailBio.innerHTML = data.bio || '<p>Біографічна довідка буде додана згодом.</p>';
                    
                    // 4. Заповнюємо дисципліни
                    detailDisciplines.innerHTML = ''; // Очищуємо
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
                    
                    // 5. Заповнюємо посилання
                    detailLinks.innerHTML = ''; // Очищуємо
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

                    // Відкриваємо вікно деталей
                    openModal('staff-detail-modal');
                    
                } else {
                    // Заглушка, якщо дані не знайдені
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
