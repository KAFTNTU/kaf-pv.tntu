/* Це головний файл логіки (JavaScript).
    Він "оживляє" всі кнопки, спливаючі вікна та анімації.
    Він підключається в самому низу index.html.
*/

// Чекаємо, поки вся сторінка (HTML) завантажиться
document.addEventListener('DOMContentLoaded', function() {

    // === 1. Базові налаштування ===
    const htmlEl = document.documentElement; // Це тег <html>
    const modalOverlay = document.getElementById('modal-overlay'); // Це єдиний темний фон

    // === 2. Логіка Мобільного Меню (Бургер) ===
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden'); // Показати/сховати
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // === 3. Кнопка "Нагору" ===
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        // Коли гортаємо сторінку
        window.onscroll = function() {
            // Якщо прогортали 300px вниз, показати кнопку
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        };
        // Коли тиснемо на кнопку - плавно повернути нагору
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // === 4. Анімація появи секцій при гортанні ===
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        // Створюємо "спостерігача"
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Коли секція з'являється на екрані
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Додати клас
                }
            });
        }, {
            threshold: 0.1 // Спрацювати, коли 10% секції видно
        });
        // Запускаємо "спостерігача" для всіх секцій
        revealElements.forEach(el => {
            observer.observe(el);
        });
    }

    // === 5. Кнопка "Показати всіх" (у вкладці Персонал) ===
    const toggleStaffBtn = document.getElementById('toggle-staff-btn');
    const hiddenStaff = document.getElementById('hidden-staff');
    const toggleStaffText = document.getElementById('toggle-staff-text');
    const toggleStaffIcon = document.getElementById('toggle-staff-icon');

    if (toggleStaffBtn) {
        toggleStaffBtn.addEventListener('click', () => {
            const isHidden = hiddenStaff.classList.toggle('hidden');
            toggleStaffIcon.classList.toggle('rotate-180'); // Крутити стрілку
            if (isHidden) {
                toggleStaffText.textContent = 'Показати всіх';
            } else {
                toggleStaffText.textContent = 'Згорнути';
            }
        });
    }
    
    // === 6. ЗАГАЛЬНА ЛОГІКА МОДАЛЬНИХ ВІКОН ===
    
    const allModals = document.querySelectorAll('.modal-base');
    // Знайти *абсолютно всі* посилання в навігації
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');
    
    // Функція, що ВІДКРИВАЄ вікно
    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            
            // 1. Показати темний фон
            modalOverlay.classList.remove('hidden');
            
            // 2. Показати вікно
            targetModal.classList.remove('hidden');
            setTimeout(() => {
                // 3. Зробити їх плавними (непрозорими)
                modalOverlay.style.opacity = '1';
                targetModal.classList.add('modal-visible');
            }, 10); // 10ms затримка
            
            // 4. Заблокувати гортання сторінки
            htmlEl.classList.add('modal-open');

            // 5. (Важливо) Скинути вкладки у "Кафедра" на "Історія"
            if (modalId === 'kafedra-modal') {
                resetKafedraTabs();
            }
        }
    }

    // Функція, що ЗАКРИВАЄ вікно
    function closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('modal-visible');
        
        // Зачекати 300ms (поки анімація зникнення пройде)
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // Перевірити, чи є ще *інші* відкриті вікна
            const anyModalStillVisible = document.querySelector('.modal-base.modal-visible');
            
            // Якщо інших вікон немає - сховати темний фон
            if (!anyModalStillVisible) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                }, 300); 
            }
            
        }, 300); 
    }

    // Налаштувати всі кнопки-"хрестики"
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const modalToClose = e.target.closest('.modal-base');
            closeModal(modalToClose);
        });
    });

    // Налаштувати закриття по кліку на темний фон
    modalOverlay.addEventListener('click', () => {
        document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
             closeModal(modal);
        });
    });

    // Налаштувати закриття по клавіші "Escape"
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Шукаємо вікно "Деталі" (z-60)
            const topModal = document.querySelector('.modal-base.modal-visible[style*="z-index: 60"]');
            if (topModal) {
                closeModal(topModal); // Закрити лише його
            } else {
                // Якщо його немає, закрити всі інші
                document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
                     closeModal(modal);
                });
            }
        }
    });

    // === 7. Логіка Навігації (Кліки по посиланнях меню) ===
    let neonTimer = null; // Змінна для таймера неону

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            const modalId = this.dataset.modalId; // Назва вікна (напр. "news-modal")
            const targetId = this.dataset.targetId; // Назва секції (напр. "news")
            const tabTarget = this.dataset.tabTarget; // Назва вкладки (напр. "tab-history")
            
            // A. Якщо це посилання відкриває МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); // Не переходити по посиланню
                e.stopPropagation(); // (ВИПРАВЛЕННЯ) Зупинити клік, щоб він не "провалився" на фон
                
                // Закрити всі інші вікна
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) {
                        closeModal(m);
                    }
                });

                // Відкрити наше вікно
                openModal(modalId);
                
                // Якщо нам треба активувати певну вкладку
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        const tabButtons = targetModal.querySelectorAll('.modal-tab');
                        const tabPanes = targetModal.querySelectorAll('.modal-tab-pane');
                        
                        // Сховати всі вкладки
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        tabPanes.forEach(pane => pane.classList.remove('active'));
                        
                        // Показати потрібну
                        const targetButton = targetModal.querySelector(`.modal-tab[data-tab="${tabTarget}"]`);
                        const targetPane = document.getElementById(tabTarget);
                        
                        if (targetButton) targetButton.classList.add('active');
                        if (targetPane) targetPane.classList.add('active');
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР (напр. "Спеціальності")
            else {
                // Просто закрити всі вікна
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
            }
            
            // C. Логіка Неонової Підсвітки Заголовка
            if (targetId) {
                let targetTitle;
                
                // Знайти заголовок (або у вікні, або на сторінці)
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

                // Увімкнути неон на 1.5 сек
                if (targetTitle) {
                    if (neonTimer) clearTimeout(neonTimer); // Скинути старий таймер
                    
                    document.querySelectorAll('.section-title-active').forEach(el => {
                        el.classList.remove('section-title-active');
                    });
                    
                    targetTitle.classList.add('section-title-active');
                    
                    // Вимкнути через 1.5 сек (1500 ms)
                    neonTimer = setTimeout(() => {
                        targetTitle.classList.remove('section-title-active');
                    }, 1500); 
                }
            }

            // D. Закрити мобільне меню (якщо воно відкрите)
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.remove('hidden');
                menuCloseIcon.classList.add('hidden');
            }
        });
    });

    // === 8. Логіка Слайдера Новин ===
    const sliderContainer = document.getElementById('news-slider-container');
    const dotsContainer = document.getElementById('news-dots-container');
    
    if (sliderContainer && dotsContainer) {
        const slides = sliderContainer.querySelectorAll('.news-slide');
        const dots = [];
        // Показувати 1 слайд на моб, 2 на десктопі
        const slidesPerView = window.innerWidth < 640 ? 1 : 2; 
        const totalDots = Math.ceil(slides.length / slidesPerView);

        // Створюємо "горошинки"
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

        // Функція, що оновлює активну "горошинку"
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

    // === 9. Логіка "Читати Далі" (Маленьке вікно новин) ===
    const openSmallModalButtons = document.querySelectorAll('.open-small-modal-btn');
    const smallModal = document.getElementById('small-news-modal');
    
    if (smallModal && openSmallModalButtons.length > 0) {
        const modalDate = document.getElementById('small-news-date');
        const modalTitle = document.getElementById('small-news-title');
        const modalText = document.getElementById('small-news-modal-text');

        openSmallModalButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Не закривати велике вікно

                // Взяти дані з кнопки (data-title, data-date...)
                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); 

                // Відкрити маленьке вікно
                openModal('small-news-modal'); 
            });
        });
    }
    
    // === 10. Логіка Вкладок (Tabs) у вікні "Кафедра" ===
    const kafedraModal = document.getElementById('kafedra-modal');
    const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
    const tabContents = kafedraModal.querySelectorAll('.modal-tab-pane');
    
    // Функція, що скидає вкладки на "Історія"
    function resetKafedraTabs() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        tabButtons[0].classList.add('active'); // "Історія"
        document.getElementById('tab-history').classList.add('active');
    }

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // (ВИПРАВЛЕННЯ) Зупинити "провалювання" кліку
                
                const targetTabId = button.dataset.tab;
                
                // Звичайна логіка перемикання вкладок
                const targetContent = document.getElementById(targetTabId);
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // === 11. Логіка випадаючих меню (Dropdowns) для мобільних ===
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // (ВИПРАВЛЕННЯ) Зупинити "провалювання" кліку
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
                toggle.querySelector('svg').classList.toggle('rotate-180');
            }
        });
    });

    // === 12. Логіка: Детальне вікно викладача ===
    
    // Елементи у вікні (куди ми вставлятимемо дані)
    const detailName = document.getElementById('staff-detail-name');
    const detailTitle = document.getElementById('staff-detail-title');
    const detailImg = document.getElementById('staff-detail-img');
    const detailDetails = document.getElementById('staff-detail-details');
    const detailLinks = document.getElementById('staff-detail-links');
    const detailDisciplines = document.getElementById('staff-detail-disciplines');
    const detailBio = document.getElementById('staff-detail-bio');

    // Знайти всі картки викладачів
    document.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Не закривати вікно "Персонал"
            const staffId = card.dataset.staffId; // Отримати ID (напр. "palamar")
            
            // Перевірити, чи існує файл staff_data.js і чи є там цей викладач
            if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                const data = staffDetailsData[staffId]; // Отримати дані з staff_data.js

                // 1. Заповнити ім'я, посаду, фото
                detailName.textContent = data.name;
                detailTitle.textContent = data.title;
                detailImg.src = card.querySelector('img').src; // Взяти фото з картки, на яку натиснули
                detailImg.alt = `Фото ${data.name}`;
                
                // 2. Заповнити деталі (Посада, ступінь)
                detailDetails.innerHTML = data.details || '';
                
                // 3. Заповнити біографію
                detailBio.innerHTML = data.bio || '<p>Біографічна довідка буде додана згодом.</p>';
                
                // 4. Заповнити список дисциплін
                detailDisciplines.innerHTML = ''; // Очистити старий список
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
                
                // 5. Заповнити список посилань
                detailLinks.innerHTML = ''; // Очистити
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

                // Відкрити вікно "Деталі" (z-60)
                openModal('staff-detail-modal');
                
            } else {
                // Якщо дані не знайдені у staff_data.js
                console.warn(`Дані для викладача з ID: ${staffId} не знайдені у staff_data.js`);
                // Показати "заглушку"
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

});
