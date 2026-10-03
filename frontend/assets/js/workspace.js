(() => {
    const storage = {
        read(key, fallback) {
            try {
                const value = localStorage.getItem(key);
                return value === null ? fallback : JSON.parse(value);
            } catch {
                return fallback;
            }
        },
        write(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };

    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const notify = (message, type = 'success') => {
        let region = document.querySelector('.toast-region');
        if (!region) {
            region = document.createElement('div');
            region.className = 'toast-region';
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'false');
            document.body.append(region);
        }

        const toast = document.createElement('div');
        toast.className = 'app-toast';
        toast.dataset.type = type;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        const icon = document.createElement('i');
        icon.className = `fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`;
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = message;
        toast.append(icon, text);
        region.append(toast);
        window.setTimeout(() => toast.remove(), 3600);
    };

    const applyTheme = theme => {
        const normalized = theme === 'dark' ? 'dark' : 'light';
        document.body.dataset.theme = normalized;
        document.body.classList.toggle('dark-theme', normalized === 'dark');
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.setAttribute('aria-label', normalized === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
            toggle.setAttribute('aria-pressed', String(normalized === 'dark'));
            toggle.innerHTML = `<i class="fa-solid ${normalized === 'dark' ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
        }
    };

    const setTheme = theme => {
        const normalized = theme === 'dark' ? 'dark' : 'light';
        localStorage.setItem('theme', normalized);
        localStorage.removeItem('plannerTheme');
        applyTheme(normalized);
    };

    const storedTheme = localStorage.getItem('theme') || localStorage.getItem('plannerTheme') || 'light';
    applyTheme(storedTheme);

    const page = location.pathname.split('/').pop() || 'dashboard.html';
    const activePage = page === 'ai-planner.html' ? 'planner.html' : page;
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        const item = link.closest('li');
        const isCurrent = link.getAttribute('href')?.split('/').pop() === activePage;
        item?.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    const user = storage.read('studyPlannerUser', null);
    const profile = storage.read('studyPlannerProfile', {});
    const name = profile.displayName || user?.fullName || localStorage.getItem('username') || 'Student';
    document.body.classList.toggle('reduce-motion', Boolean(storage.read('studyPlannerSettings', {}).reduceMotion));
    document.querySelectorAll('#dashboardUser, #welcomeUser, [data-user-name]').forEach(element => {
        element.textContent = name;
    });

    let sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.dashboard-navbar, .topbar');
    let leftSection = header?.querySelector('.left-section');
    if (!leftSection && header?.classList.contains('topbar')) {
        leftSection = header.firstElementChild;
        leftSection?.classList.add('left-section');
    }
    let menuToggle = document.getElementById('menuToggle');
    if (sidebar && leftSection && !menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.id = 'menuToggle';
        menuToggle.className = 'icon-btn mobile-menu';
        menuToggle.type = 'button';
        menuToggle.setAttribute('aria-label', 'Open navigation');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        leftSection.prepend(menuToggle);
    }

    let backdrop;
    const closeSidebar = () => {
        sidebar?.classList.remove('show');
        backdrop?.remove();
        backdrop = null;
        menuToggle?.setAttribute('aria-expanded', 'false');
    };

    menuToggle?.addEventListener('click', () => {
        const open = !sidebar.classList.contains('show');
        sidebar.classList.toggle('show', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        if (open) {
            backdrop = document.createElement('button');
            backdrop.className = 'sidebar-backdrop';
            backdrop.type = 'button';
            backdrop.setAttribute('aria-label', 'Close navigation');
            backdrop.addEventListener('click', closeSidebar, { once: true });
            document.body.append(backdrop);
        } else {
            closeSidebar();
        }
    });

    document.querySelectorAll('.sidebar-menu a').forEach(link => link.addEventListener('click', closeSidebar));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) closeSidebar();
    });

    document.querySelectorAll('img').forEach(image => {
        const replaceMissingImage = () => {
            const fallback = document.createElement('span');
            fallback.className = 'image-fallback';
            fallback.setAttribute('role', 'img');
            fallback.setAttribute('aria-label', image.alt || 'Image unavailable');
            fallback.innerHTML = '<i class="fa-regular fa-user" aria-hidden="true"></i>';
            image.replaceWith(fallback);
        };
        image.addEventListener('error', replaceMissingImage, { once: true });
        if (image.complete && image.naturalWidth === 0) replaceMissingImage();
    });

    const loader = document.getElementById('loader');
    if (loader) {
        const hideLoader = () => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            window.setTimeout(() => loader.remove(), 450);
        };
        if (document.readyState === 'complete') hideLoader();
        else window.addEventListener('load', hideLoader, { once: true });
    }

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    });

    window.StudyPlanner = { storage, escapeHtml, notify, setTheme };
})();