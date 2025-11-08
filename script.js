document.addEventListener('DOMContentLoaded', function() {

    const htmlEl = document.documentElement; // Отримуємо <html>
    const modalOverlay = document.getElementById('modal-overlay'); // Отримуємо ОДИН фон

    // --- 1. Логіка визначення платформи (Приховано) ---
    // (Ми додали це, але приховали на ваше прохання)
    // const platformDemo = document.getElementById('platform-demo');
    // if (platformDemo) {
    //     let os = 'Unknown OS';
    //     const userAgent = navigator.userAgent;
    //     if (userAgent.indexOf('Win') !== -1) os = 'Windows';
    //     if (userAgent.indexOf('Mac') !== -1) os = 'Apple (macOS/iOS)';
    //     if (userAgent.indexOf('Android') !== -1) os = 'Android';
    //     if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    //     if (os) {
    //         document.documentElement.classList.add(`platform-${os.toLowerCase().split(' ')[0].split('(')[0]}`);
    //     }
    //     // platformDemo.textContent = `Визначена платформа: ${os}`; // Приховано
    // }

    // --- 2. Mobile Menu Toggle ---
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

    // --- 3. Scroll to Top Button ---
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

    // --- 4. Animate on Scroll (Reveal) ---
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

    // --- 5. Staff Toggle (у модальному вікні) ---
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
    
    // --- 6. ЗАГАЛЬНА ЛОГІКА МОДАЛЬНИХ ВІКОН (ОНОВЛЕНО) ---
    
    const allModals = document.querySelectorAll('.modal-base');
    // ВИПРАВЛЕНО: Тепер "слухаємо" і .dropdown-link
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');
    
    // Функція відкриття модалки
    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            
            // ЗАВЖДИ показуємо фон
            modalOverlay.classList.remove('hidden');
            
            targetModal.classList.remove('hidden');
            setTimeout(() => {
                // ЗАВЖДИ вмикаємо opacity
                modalOverlay.style.opacity = '1';
                targetModal.classList.add('modal-visible');
            }, 10);
            
            // ЗАВЖДИ блокуємо скрол
            htmlEl.classList.add('modal-open');
        }
    }

    // Функція закриття модалки
    function closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('modal-visible');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // Перевіряємо, чи ЗАЛИШИЛИСЬ ще якісь *видимі* модалки
            // Ми шукаємо будь-яку модалку, яка все ще має клас modal-visible
            const anyModalStillVisible = document.querySelector('.modal-base.modal-visible');
            
            if (!anyModalStillVisible) {
                // Якщо ні - ховаємо фон і розблоковуємо скрол
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                }, 300); // даємо час зникнути
            }
            
        }, 300); // 300ms - це час transition в CSS
    }

    // Закриття по кнопці "хрестик"
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Зупинити "провалювання" кліку
            // Знайти найближчу модалку, до якої належить кнопка, і закрити її
            const modalToClose = e.target.closest('.modal-base');
            closeModal(modalToClose);
        });
    });

    // Закриття по кліку на фон (лише для головного фону)
    modalOverlay.addEventListener('click', () => {
        // Знайти всі видимі модалки і закрити їх
        document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
             closeModal(modal);
        });
    });

    // Закриття по клавіші Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Спочатку закриваємо найвищу модалку (z-60), якщо вона є
            const topModal = document.querySelector('.modal-base.modal-visible[style*="z-index: 60"]');
            if (topModal) {
                closeModal(topModal);
            } else {
                // Якщо немає, закриваємо всі видимі z-50
                document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
                     closeModal(modal);
                });
            }
        }
    });

    // --- 7. Логіка Навігації (Кліки по посиланнях) ---

    let neonTimer = null; // Таймер для неону

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            
            const modalId = this.dataset.modalId;
            const targetId = this.dataset.targetId; // ID секції або заголовка
            const tabTarget = this.dataset.tabTarget; // ID вкладки
            
            // A. Якщо це посилання відкриває МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); // Заборонити прокрутку
                e.stopPropagation(); // ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку на фон
                
                // 1. Закрити ВСІ відкриті вікна (окрім того, що ми відкриваємо)
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) {
                        closeModal(m);
                    }
                });

                // 2. Відкрити потрібне вікно
                openModal(modalId);
                
                // 3. (Нове) Активувати потрібну вкладку, якщо вказано
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        // Знайти всі кнопки та панелі вкладок у цьому вікні
                        const tabButtons = targetModal.querySelectorAll('.modal-tab');
                        const tabPanes = targetModal.querySelectorAll('.modal-tab-pane');
                        
                        // Деактивувати всі
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        tabPanes.forEach(pane => pane.classList.remove('active'));
                        
                        // Активувати потрібні
                        const targetButton = targetModal.querySelector(`.modal-tab[data-tab="${tabTarget}"]`);
                        const targetPane = document.getElementById(targetTabId);
                        
                        if (targetButton) targetButton.classList.add('active');
                        if (targetPane) targetPane.classList.add('active');
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР (Спеціальності, Контакти)
            else {
                // Закрити всі модалки
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
            }
            
            // C. Логіка Неонової Підсвітки Заголовка
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

    // --- 8. Логіка Слайдера Новин (у модальному вікні) ---
    const sliderContainer = document.getElementById('news-slider-container');
    const dotsContainer = document.getElementById('news-dots-container');
    
    if (sliderContainer && dotsContainer) {
        const slides = sliderContainer.querySelectorAll('.news-slide');
        const dots = [];
        const slidesPerView = window.innerWidth < 640 ? 1 : 2; // 1 на моб, 2 на десктопі
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

        // Функція оновлення активної "горошинки"
        const updateDots = () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const containerWidth = sliderContainer.clientWidth;
            
            // Визначаємо, який "набір" слайдів зараз активний
            let activeDotIndex = Math.round(scrollLeft / containerWidth);
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        };

        if (dots.length > 0) dots[0].classList.add('active'); // Активуємо першу
        sliderContainer.addEventListener('scroll', updateDots, { passive: true });
    }

    // --- 9. Логіка "Читати Далі" (Маленьке вікно новин) ---
    const openSmallModalButtons = document.querySelectorAll('.open-small-modal-btn');
    const smallModal = document.getElementById('small-news-modal');
    
    if (smallModal && openSmallModalButtons.length > 0) {
        const modalDate = document.getElementById('small-news-date');
        const modalTitle = document.getElementById('small-news-title');
        const modalText = document.getElementById('small-news-modal-text');

        openSmallModalButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Зупинити клік, щоб не закрити велику модалку

                // Заповнюємо даними
                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); // Для переносів рядків

                // Показуємо
                openModal('small-news-modal'); // Використовуємо нашу нову функцію
            });
        });
    }
    
    // --- 10. Логіка Вкладок (Tabs) у модалці "Кафедра" ---
    const tabsContainer = document.querySelector('.modal-tabs-container');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.modal-tab');
        const tabContents = tabsContainer.closest('.modal-content-inner').querySelectorAll('.modal-tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Зупинити "провалювання" кліку
                
                const targetTabId = button.dataset.tab;
                
                // Спеціальний випадок: кнопка "Персонал кафедри"
                if (button.dataset.modalId) {
                    openModal(button.dataset.modalId);
                    // Підсвічуємо заголовок персоналу
                    const staffTitle = document.getElementById('staff-title');
                    if (staffTitle) {
                         if (neonTimer) clearTimeout(neonTimer);
                         staffTitle.classList.add('section-title-active');
                         neonTimer = setTimeout(() => {
                            staffTitle.classList.remove('section-title-active');
                         }, 1500);
                    }
                    return; // Не перемикаємо вкладку, просто відкриваємо модалку
                }

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

    // --- 11. Логіка випадаючих меню (Dropdowns) для мобільних ---
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Зупинити "провалювання" кліку
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
                toggle.querySelector('svg').classList.toggle('rotate-180');
            }
        });
    });

    // --- 12. НОВА ЛОГІКА: Детальне вікно викладача ---
    const staffDetailModal = document.getElementById('staff-detail-modal');
    
    // Елементи у вікні деталей
    const detailName = document.getElementById('staff-detail-name');
    const detailTitle = document.getElementById('staff-detail-title');
    const detailImg = document.getElementById('staff-detail-img');
    const detailDetails = document.getElementById('staff-detail-details');
    const detailLinks = document.getElementById('staff-detail-links');
    const detailDisciplines = document.getElementById('staff-detail-disciplines');
    const detailBio = document.getElementById('staff-detail-bio');

    document.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Зупинити "провалювання" кліку
            const staffId = card.dataset.staffId;
            
            // Перевіряємо, чи існують дані ТА чи існує файл staff_data.js
            if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                const data = staffDetailsData[staffId];

                // 1. Заповнюємо базові дані
                detailName.textContent = data.name;
                detailTitle.textContent = data.title;
                detailImg.src = card.querySelector('img').src; // Беремо фото з картки
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
                     data.links.forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.className = 'text-sky-400 hover:text-sky-300 block truncate';
                        a.textContent = link.name;
                        detailLinks.appendChild(a);
                    });
                } else {
                    const p = document.createElement('p');
                    p.className = 'text-sm text-slate-400';
                    p.textContent = 'Посилання відсутні.';
                    detailLinks.appendChild(p);
                }

                // Відкриваємо модальне вікно деталей
                openModal('staff-detail-modal');
                
            } else {
                // Заглушка, якщо дані не знайдені
                console.warn(`Дані для викладача з ID: ${staffId} не знайдені у staff_data.js`);
                detailName.textContent = "Інформація відсутня";
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
    
    // --- 13. НОВА ЛОГІКА: Вкладки у вікні Деталей Викладача ---
    const detailTabsContainer = document.querySelector('#staff-detail-modal .border-b');
    if (detailTabsContainer) {
        const tabButtons = detailTabsContainer.querySelectorAll('.detail-tab-button');
        const tabPanes = detailTabsContainer.parentElement.querySelectorAll('.detail-tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Зупинити "провалювання" кліку
                const targetTabId = button.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                button.classList.add('active');
                const targetPane = document.getElementById(targetTabId);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    }

});
