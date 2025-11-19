// --- 1. ФУНКЦІЯ ЗАВАНТАЖЕННЯ HTML ---
async function loadSections() {
    const contents = document.querySelectorAll('.tab-content[data-src]');
    const promises = [];

    contents.forEach(content => {
        const src = content.getAttribute('data-src');
        const p = fetch(src)
            .then(res => {
                if (!res.ok) throw new Error(`Error loading ${src}`);
                return res.text();
            })
            .then(html => content.innerHTML = html)
            .catch(err => console.error(err));
        promises.push(p);
    });

    await Promise.all(promises);
}

// --- 2. ГЛОБАЛЬНІ ФУНКЦІЇ ---
window.switchTab = function(tabId, scrollTargetId = null, subTabTarget = null) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn, .mobile-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) btn.classList.add('active');
    });

    const targetSection = document.getElementById('tab-' + tabId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.remove('fade-in');
        void targetSection.offsetWidth; 
        targetSection.classList.add('fade-in');
    }

    if (subTabTarget) switchSubTab(subTabTarget);

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    }

    if (scrollTargetId) {
        setTimeout(() => {
            const el = document.getElementById(scrollTargetId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.switchSubTab = function(subTabId) {
    const parentSection = document.getElementById('tab-kafedra'); 
    if (!parentSection) return;

    parentSection.querySelectorAll('.sub-tab-content').forEach(el => el.classList.add('hidden'));
    parentSection.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetSub = document.getElementById(subTabId);
    if (targetSub) targetSub.classList.remove('hidden');
    
    const btns = parentSection.querySelectorAll('.sub-tab-btn');
    btns.forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(subTabId)) {
            btn.classList.add('active');
        }
    });
};

window.toggleMobileSubmenu = function(id) {
    const submenu = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (submenu) {
        if (submenu.classList.contains('hidden')) {
            submenu.classList.remove('hidden');
            submenu.classList.add('flex');
            if(icon) icon.classList.add('rotate-180');
        } else {
            submenu.classList.add('hidden');
            submenu.classList.remove('flex');
            if(icon) icon.classList.remove('rotate-180');
        }
    }
};

window.toggleReadMore = function(btn, targetId) {
    const container = document.getElementById(targetId);
    if (container) {
        container.classList.toggle('text-clamp');
        container.classList.toggle('text-expanded');
        btn.textContent = container.classList.contains('text-expanded') ? 'Згорнути' : 'Читати далі';
    }
};

window.openModal = function(modalId) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById(modalId);
    if (overlay && modal) {
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('opacity-0', 'scale-95');
            modal.classList.add('scale-100');
        }, 10);
    }
};

window.closeAllModals = function() {
    const overlay = document.getElementById('modal-overlay');
    const modals = document.querySelectorAll('#staff-detail-modal');
    modals.forEach(m => {
        m.classList.add('opacity-0', 'scale-95');
        m.classList.remove('scale-100');
        setTimeout(() => m.classList.add('hidden'), 300);
    });
    if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

// --- 3. ІНІЦІАЛІЗАЦІЯ ---
document.addEventListener('DOMContentLoaded', async function() {
    await loadSections();

    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
    });
    if(closeMobileBtn) closeMobileBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    });

    document.body.addEventListener('click', function(e) {
        const card = e.target.closest('.staff-card');
        if (card) {
            const staffId = card.dataset.staffId;
            if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                const data = staffDetailsData[staffId];
                document.getElementById('staff-detail-name').textContent = data.name;
                document.getElementById('staff-detail-title').textContent = data.title;
                document.getElementById('staff-detail-img').src = card.querySelector('img').src;
                document.getElementById('staff-detail-details').innerHTML = data.details;
                
                const discContainer = document.getElementById('staff-detail-disciplines');
                discContainer.innerHTML = data.disciplines.length ? data.disciplines.map(d => `<div class="mb-1">• ${d}</div>`).join('') : 'Немає даних';
                
                const linkContainer = document.getElementById('staff-detail-links');
                linkContainer.innerHTML = data.links.length ? data.links.map(l => `<a href="${l.url}" target="_blank" class="block hover:underline mb-1 text-sky-400">${l.name}</a>`).join('') : 'Немає посилань';

                const bioEl = document.getElementById('staff-detail-bio');
                if(bioEl) bioEl.innerHTML = data.bio || '';

                openModal('staff-detail-modal');
            }
        }
    });

    const scrollBtn = document.getElementById('scrollToTopBtn');
    if(scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollBtn.classList.remove('hidden');
            else scrollBtn.classList.add('hidden');
        });
    }

    switchTab('home');
});
