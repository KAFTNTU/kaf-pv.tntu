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

            // ВИПРАВЛЕННЯ: Скидаємо вкладки "Кафедра" до "Історії" при кожному відкритті
            if (modalId === 'kafedra-modal') {
                resetKafedraTabs();
            }
        }
    }

    // Функція закриття модалки
    function closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('modal-visible');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            
            const anyModalStillVisible = document.querySelector('.modal-base.modal-visible');
            
            if (!anyModalStillVisible) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => {
                    modalOverlay.classList.add('hidden');
                }, 300); 
            }
            
        }, 300); 
    }

    // Закриття по кнопці "хрестик"
    document.querySelectorAll('.modal-close-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const modalToClose = e.target.closest('.modal-base');
            closeModal(modalToClose);
        });
    });

    // Закриття по кліку на фон (лише для головного фону)
    modalOverlay.addEventListener('click', () => {
        document.querySelectorAll('.modal-base.modal-visible').forEach(modal => {
             closeModal(modal);
        });
    });

    // Закриття по клавіші Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            const topModal = document.querySelector('.modal-base.modal-visible[style*="z-index: 60"]');
            if (topModal) {
                closeModal(topModal);
            } else {
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
            const targetId = this.dataset.targetId; 
            const tabTarget = this.dataset.tabTarget; 
            
            // A. Якщо це посилання відкриває МОДАЛЬНЕ ВІКНО
            if (modalId) {
                e.preventDefault(); 
                e.stopPropagation(); // ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку на фон
                
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) {
                        closeModal(m);
                    }
                });

                openModal(modalId);
                
                // 3. Активувати потрібну вкладку, якщо вказано
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        const tabButtons = targetModal.querySelectorAll('.modal-tab');
                        const tabPanes = targetModal.querySelectorAll('.modal-tab-pane');
                        
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        tabPanes.forEach(pane => pane.classList.remove('active'));
                        
                        const targetButton = targetModal.querySelector(`.modal-tab[data-tab="${tabTarget}"]`);
                        const targetPane = document.getElementById(tabTarget);
                        
                        if (targetButton) targetButton.classList.add('active');
                        if (targetPane) targetPane.classList.add('active');
                    }
                }
            }
            // B. Якщо це звичайне посилання-ЯКІР
            else {
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
                    }, 1500); 
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
                e.stopPropagation(); 

                modalDate.textContent = this.dataset.date;
                modalTitle.textContent = this.dataset.title;
                modalText.textContent = this.dataset.text.replace(/\\n/g, '\n'); 

                openModal('small-news-modal'); 
            });
        });
    }
    
    // --- 10. Логіка Вкладок (Tabs) у модалці "Кафедра" ---
    const kafedraModal = document.getElementById('kafedra-modal');
    const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
    const tabContents = kafedraModal.querySelectorAll('.modal-tab-pane');
    
    // Функція для скидання вкладок
    function resetKafedraTabs() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Встановити "Історія" як активну
        tabButtons[0].classList.add('active');
        document.getElementById('tab-history').classList.add('active');
    }

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку
                
                const targetTabId = button.dataset.tab;
                
                // Спеціальний випадок: кнопка "Персонал кафедри"
                if (button.dataset.modalId) {
                    // Ця логіка більше не потрібна, оскільки персонал - це вкладка
                    // openModal(button.dataset.modalId); 
                    // ...
                    // return; 
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
            e.stopPropagation(); // ВИПРАВЛЕННЯ: Зупинити "провалювання" кліку
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

});
