/*
================================================================
ГОЛОВНИЙ СКРИПТ САЙТУ (script.js)
================================================================
Функціонал:
- Відкриття/закриття модальних вікон
- Перемикання вкладок
- Мобільне меню
- Слайдер новин
- Логіка "Читати далі"
- Деталі викладачів
- Анімації та підсвітка заголовків
================================================================
*/

document.addEventListener('DOMContentLoaded', function() {

    // --- 0. ГЛОБАЛЬНІ ЗМІННІ ---
    const htmlEl = document.documentElement;
    const modalOverlay = document.getElementById('modal-overlay');
    const allModals = document.querySelectorAll('.modal-base');
    const allNavLinks = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');
    let neonTimer = null;

    // === ДОПОМІЖНІ ФУНКЦІЇ ===

    // Функція активації вкладки (для модалок)
    function activateTab(modal, tabId) {
        const tabButtons = modal.querySelectorAll('.modal-tab');
        const tabContents = modal.querySelectorAll('.modal-tab-pane');
        const targetContent = document.getElementById(tabId);
        const targetButton = modal.querySelector(`.modal-tab[data-tab="${tabId}"]`);
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        if (targetButton) targetButton.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
    }

    // Скидання вкладок кафедри
    function resetKafedraTabs() {
        const kafedraModal = document.getElementById('kafedra-modal');
        if (kafedraModal) activateTab(kafedraModal, 'tab-history');
    }

    // --- 1. ЛОГІКА МОБІЛЬНОГО МЕНЮ ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    // --- 2. КНОПКА "НАГОРУ" ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300)
                scrollToTopBtn.classList.remove('hidden');
            else scrollToTopBtn.classList.add('hidden');
        };
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- 3. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ СКРОЛІ ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    }

    // --- 4. КНОПКА "ПОКАЗАТИ ВСІХ" (Персонал) ---
    const toggleStaffBtn = document.getElementById('toggle-staff-btn');
    const hiddenStaff = document.getElementById('hidden-staff');
    const toggleStaffText = document.getElementById('toggle-staff-text');
    const toggleStaffIcon = document.getElementById('toggle-staff-icon');

    if (toggleStaffBtn) {
        toggleStaffBtn.addEventListener('click', () => {
            const isHidden = hiddenStaff.classList.toggle('hidden');
            toggleStaffIcon.classList.toggle('rotate-180');
            toggleStaffText.textContent = isHidden ? 'Показати всіх' : 'Згорнути';
        });
    }

    // --- 5. МОДАЛЬНІ ВІКНА ---
    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (!targetModal || !modalOverlay) return;
        modalOverlay.classList.remove('hidden');
        targetModal.classList.remove('hidden');
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            targetModal.classList.add('modal-visible');
        }, 10);
        htmlEl.classList.add('modal-open');
        if (modalId === 'kafedra-modal') resetKafedraTabs();
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('modal-visible');
        setTimeout(() => {
            modal.classList.add('hidden');
            const anyVisible = document.querySelector('.modal-base.modal-visible');
            if (!anyVisible && modalOverlay) {
                modalOverlay.style.opacity = '0';
                htmlEl.classList.remove('modal-open');
                setTimeout(() => modalOverlay.classList.add('hidden'), 300);
            }
        }, 300);
    }

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', e => closeModal(e.target.closest('.modal-base')));
    });

    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const topModal = document.querySelector('#staff-detail-modal.modal-visible');
            if (topModal) closeModal(topModal);
            else document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
        }
    });

    // --- 6. НАВІГАЦІЯ ---
    allNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const modalId = this.dataset.modalId;
            const targetId = this.dataset.targetId;
            const tabTarget = this.dataset.tabTarget;

            if (modalId) {
                e.preventDefault();
                e.stopPropagation();
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => {
                    if (m.id !== modalId) closeModal(m);
                });
                openModal(modalId);
                if (tabTarget) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) activateTab(targetModal, tabTarget);
                }
            } else {
                document.querySelectorAll('.modal-base.modal-visible').forEach(m => closeModal(m));
            }

            if (targetId) {
                let targetTitle;
                if (modalId) {
                    const targetModal = document.getElementById(modalId);
                    if (targetModal) targetTitle = targetModal.querySelector('.section-title');
                } else {
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) targetTitle = targetSection.querySelector('.section-title');
                }

                if (targetTitle) {
                    if (neonTimer) clearTimeout(neonTimer);
                    document.querySelectorAll('.section-title-active').forEach(el => el.classList.remove('section-title-active'));
                    targetTitle.classList.add('section-title-active');
                    neonTimer = setTimeout(() => targetTitle.classList.remove('section-title-active'), 1500);
                }
            }

            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuOpenIcon.classList.remove('hidden');
                menuCloseIcon.classList.add('hidden');
            }
        });
    });

    // --- 7. СЛАЙДЕР НОВИН ---
    const sliderContainer = document.getElementById('news-slider-container');
    const dotsContainer = document.getElementById('news-dots-container');

    if (sliderContainer && dotsContainer) {
        const slides = sliderContainer.querySelectorAll('.news-slide');
        const slidesPerView = window.innerWidth < 640 ? 1 : 2;
        const totalDots = Math.ceil(slides.length / slidesPerView);
        const dots = [];

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'news-dot w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500';
            dot.addEventListener('click', () => {
                const slide = slides[i * slidesPerView];
                if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }

        const updateDots = () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const width = sliderContainer.clientWidth;
            const activeIndex = Math.round(scrollLeft / width);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
        };

        if (dots.length > 0) dots[0].classList.add('active');
        sliderContainer.addEventListener('scroll', updateDots, { passive: true });
    }

    // --- 8. МАЛЕ ВІКНО "ЧИТАТИ ДАЛІ" ---
    const openSmallModalButtons = document.querySelectorAll('.open-small-modal-btn');
    const smallModal = document.getElementById('small-news-modal');
    if (smallModal && openSmallModalButtons.length > 0) {
        const modalDate = document.getElementById('small-news-date');
        const modalTitle = document.getElementById('small-news-title');
        const modalText = document.getElementById('small-news-modal-text');
        openSmallModalButtons.forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                modalDate.textContent = button.dataset.date;
                modalTitle.textContent = button.dataset.title;
                modalText.textContent = button.dataset.text.replace(/\\n/g, '\n');
                openModal('small-news-modal');
            });
        });
    }

    // --- 9. ВКЛАДКИ В МОДАЛЦІ "КАФЕДРА" ---
    const kafedraModal = document.getElementById('kafedra-modal');
    if (kafedraModal) {
        const tabButtons = kafedraModal.querySelectorAll('.modal-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', e => {
                e.stopPropagation();
                const tabId = button.dataset.tab;
                const modalToOpen = button.dataset.modalId;
                if (modalToOpen) {
                    openModal(modalToOpen);
                } else if (tabId) {
                    activateTab(kafedraModal, tabId);
                }
            });
        });
    }

    // --- 10. ВИПАДАЮЧІ МЕНЮ (МОБІЛЬНА ВЕРСІЯ) ---
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', e => {
            e.preventDefault();
            const menuId = toggle.dataset.dropdownId;
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.toggle('open');
                toggle.querySelector('svg').classList.toggle('rotate-180');
            }
        });
    });

    // --- 11. ДЕТАЛІ ПРО ВИКЛАДАЧА ---
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
            card.addEventListener('click', e => {
                e.stopPropagation();
                const id = card.dataset.staffId;
                if (typeof staffDetailsData !== 'undefined' && staffDetailsData[id]) {
                    const d = staffDetailsData[id];
                    detailName.textContent = d.name;
                    detailTitle.textContent = d.title;
                    detailImg.src = card.querySelector('img').src;
                    detailDetails.innerHTML = d.details || '';
                    detailBio.innerHTML = d.bio || '<p>Біографічна довідка буде додана згодом.</p>';
                    detailDisciplines.innerHTML = '';
                    if (d.disciplines?.length) {
                        const ul = document.createElement('ul');
                        ul.className = 'list-disc pl-5 space-y-1';
                        d.disciplines.forEach(x => {
                            const li = document.createElement('li');
                            li.textContent = x;
                            ul.appendChild(li);
                        });
                        detailDisciplines.appendChild(ul);
                    } else detailDisciplines.innerHTML = '<li>Інформація про дисципліни відсутня.</li>';
                    detailLinks.innerHTML = '';
                    if (d.links?.length) {
                        const ul = document.createElement('ul');
                        ul.className = 'list-none pl-0 space-y-1 link-list';
                        d.links.forEach(link => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.target = '_blank';
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
                    detailName.textContent = card.querySelector('h3').textContent || 'Інформація відсутня';
                    detailTitle.textContent = card.querySelector('p').textContent || '';
                    detailImg.src = card.querySelector('img').src;
                    detailDetails.innerHTML = '<p>Деталі будуть додані пізніше.</p>';
                    detailLinks.innerHTML = '<p class="text-sm text-slate-400">Посилання відсутні.</p>';
                    detailDisciplines.innerHTML = '<li>Інформація відсутня.</li>';
                    detailBio.innerHTML = '<p>Біографічна довідка буде додана згодом.</p>';
                    openModal('staff-detail-modal');
                }
            });
        });
    }
});
