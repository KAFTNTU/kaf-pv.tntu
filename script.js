document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Логіка визначення платформи ---
    const platformDemo = document.getElementById('platform-demo');
    if (platformDemo) {
        let os = 'Unknown OS';
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Win') !== -1) os = 'Windows';
        if (userAgent.indexOf('Mac') !== -1) os = 'Apple (macOS/iOS)';
        if (userAgent.indexOf('Android') !== -1) os = 'Android';
        if (userAgent.indexOf('Linux') !== -1) os = 'Linux';

        // Додаємо клас до <html> для CSS-орієнтування
        if (os) {
            document.documentElement.classList.add(`platform-${os.toLowerCase().split(' ')[0].split('(')[0]}`);
        }
        
        // --- 10. НОВА ЛОГІКА ДЛЯ ДРОПДАУНІВ (Випадаюче меню) ---
        // (Цей код залишається БЕЗ ЗМІН)
        document.addEventListener('click', (e) => {

    // --- 2. Мобільне меню ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if (mobileMenuButton && mobileMenu && menuOpenIcon && menuCloseIcon) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // Закриття мобільного меню при натисканні на посилання
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    menuOpenIcon.classList.remove('hidden');
                    menuCloseIcon.classList.add('hidden');
                }
            });
        });
    }

    // --- 3. Кнопка "Нагору" (Scroll to Top) ---
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

    // --- 4. Анімація появи секцій (.reveal) ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // (Ми можемо не відключати, якщо хочемо, щоб анімація спрацьовувала щоразу)
                    // observer.unobserve(entry.target); 
                }
            });
        }, {
            threshold: 0.1 
        });

        revealElements.forEach(el => {
            observer.observe(el);
        });
    }

    // --- 5. Логіка "Показати всіх" (Викладачі) ---
    const toggleStaffBtn = document.getElementById('toggle-staff-btn');
    const hiddenStaff = document.getElementById('hidden-staff');
    const toggleStaffText = document.getElementById('toggle-staff-text');
    const toggleStaffIcon = document.getElementById('toggle-staff-icon');

    if (toggleStaffBtn && hiddenStaff) {
        toggleStaffBtn.addEventListener('click', () => {
            const isHidden = hiddenStaff.classList.toggle('hidden');
            toggleStaffIcon.classList.toggle('rotate-180');
            toggleStaffText.textContent = isHidden ? 'Показати всіх' : 'Згорнути';
        });
    }

    // --- 6. Загальна логіка МОДАЛЬНИХ ВІКОН (велика і маленька) ---
    const htmlEl = document.documentElement;
    let activeModal = null; // Зберігаємо посилання на активне вікно

    // Функція відкриття модального вікна
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Закриваємо попереднє вікно, якщо воно є
        if (activeModal && activeModal.id !== modalId) {
             // Це виправлення "блимання"!
             // Ми не закриваємо, якщо це вже відкрите вікно (напр. клік на "читати далі")
            closeModal(activeModal);
        }

        modal.classList.remove('hidden');
        setTimeout(() => { // Даємо час 'hidden' зникнути
             modal.classList.add('modal-visible');
        }, 10);
       
        htmlEl.classList.add('modal-open'); // Блокуємо прокрутку фону
        activeModal = modal; // Запам'ятовуємо активне вікно
    }

    // Функція закриття модального вікна
    function closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('modal-visible');
        setTimeout(() => { // Чекаємо завершення анімації
            modal.classList.add('hidden');
        }, 300); // 300ms - час transition в CSS
        
        // Закриваємо ТІЛЬКИ ЯКЩО це було останнє вікно
        // Це виправляє баг, коли фон розблоковується при відкритті "читати далі"
        const anyModalOpen = document.querySelector('.modal-base.modal-visible');
        if (!anyModalOpen || anyModalOpen.id === modal.id) {
             htmlEl.classList.remove('modal-open'); // Повертаємо прокрутку
        }
        
        if (activeModal && activeModal.id === modal.id) {
            activeModal = null; // Очищуємо активне вікно
        }
    }

    // Обробник для закриття (кнопки .modal-close)
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalToClose = button.closest('.modal-base'); // Знайти батьківське модальне вікно
            if (modalToClose) {
                closeModal(modalToClose);
            }
        });
    });

    // Закриття по клавіші Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && activeModal) {
            closeModal(activeModal);
        }
    });

    // --- 7. Логіка для ВЕЛИКИХ вікон (секцій) + НЕОН заголовків ---
    // (Виправлено логіку, щоб не було "блимання")
    document.querySelectorAll('a.nav-link[data-modal-id]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = link.dataset.modalId;
            const targetTitleId = link.dataset.targetId;
            
            // Виправлення: якщо вікно ВЖЕ відкрите, не відкривати його знову
            if (activeModal && activeModal.id === modalId) {
                // Якщо вікно вже відкрите, просто підсвітимо заголовок
                 const targetTitle = document.getElementById(targetTitleId);
                 if (targetTitle) {
                     targetTitle.classList.add('section-title-active');
                     setTimeout(() => {
                         targetTitle.classList.remove('section-title-active');
                     }, 1500);
                 }
                return; 
            }
            
            // Відкриваємо модальне вікно
            openModal(modalId);

            // Активуємо неон на 1.5 сек
            const targetTitle = document.getElementById(targetTitleId);
            if (targetTitle) {
                targetTitle.classList.add('section-title-active');
                setTimeout(() => {
                    targetTitle.classList.remove('section-title-active');
                }, 1500); // 1.5 секунди
            }
        });
    });

    // Логіка для звичайних посилань (якорів) + НЕОН
    document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // e.preventDefault(); // НЕ розкоментовувати, нам потрібна прокрутка
            const targetId = link.dataset.targetId;
            if (!targetId) return; // Пропускаємо, якщо це не наша логіка

            // Активуємо неон на 1.5 сек
            const targetTitle = document.getElementById(targetId + '-title'); // шукаємо "about-title"
            if (targetTitle) {
                targetTitle.classList.add('section-title-active');
                setTimeout(() => {
                    targetTitle.classList.remove('section-title-active');
                }, 1500);
            }
            
            // Також закриваємо будь-яке активне модальне вікно
            if(activeModal) {
                closeModal(activeModal);
            }
        });
    });

    // --- 8. Логіка для МАЛЕНЬКОГО вікна новин ("Читати далі") ---
    const smallModal = document.getElementById('small-news-modal');
    if (smallModal) {
        const modalDate = document.getElementById('small-modal-date');
        const modalTitle = document.getElementById('small-modal-title');
        const modalText = document.getElementById('small-modal-text');

        document.querySelectorAll('.open-small-modal-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Зупиняємо "спливання" кліку
                
                // Отримуємо дані з кнопки
                const title = this.dataset.title;
                const date = this.dataset.date;
                const text = this.dataset.text;

                // Заповнюємо
                if (modalDate) modalDate.textContent = date;
                if (modalTitle) modalTitle.textContent = title;
                if (modalText) modalText.textContent = text;
                
                // Відкриваємо (воно стане activeModal)
                openModal('small-news-modal');
            });
        });
    }
    
    // --- 11. НОВА ЛОГІКА ДЛЯ ВНУТРІШНІХ ВКЛАДОК (Tabs) ---
    // Цей код поки що лише візуально перемикає клас 'active'
    // і відкриває модалку "Персонал"
    document.querySelectorAll('.modal-tabs-container').forEach(tabsContainer => {
        tabsContainer.addEventListener('click', e => {
            const targetLink = e.target.closest('.modal-tab-link');
            if (!targetLink) return;

            // Якщо це НЕ посилання на іншу модалку,
            // просто перемикаємо вигляд
            if (!targetLink.dataset.modalId) {
                e.preventDefault();
                
                // Знімаємо 'active' з усіх
                tabsContainer.querySelectorAll('.modal-tab-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Додаємо 'active' натиснутому
                targetLink.classList.add('active');
                
                // (Тут у майбутньому буде логіка показу різного контенту)
            }
            // Якщо це посилання на модалку (як "Персонал"), 
            // скрипт з пункту 7 сам його обробить
        });
    });

});
