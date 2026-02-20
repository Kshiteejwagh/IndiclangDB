class IndiaDict2 {
    constructor() {
        this.currentMode = 'dictionary';
        this.theme = localStorage.getItem('theme') || 'light';
        this.supabase = null;
        this.session = null;
        this.init();
    }

    async init() {
        this.applyTheme();
        this.bindEvents();
        await this.checkAuth();
    }

    async checkAuth() {
        let url = localStorage.getItem('sb_url');
        let key = localStorage.getItem('sb_key');

        // Auto-fill from default inputs if not in storage
        if (!url || !key) {
            url = document.getElementById('config-url').value;
            key = document.getElementById('config-key').value;
            if (url && key) {
                localStorage.setItem('sb_url', url);
                localStorage.setItem('sb_key', key);
            }
        }

        if (url && key) {
            try {
                this.supabase = window.supabase.createClient(url, key);
                // Ensure modal is hidden
                document.getElementById('auth-modal').style.display = 'none';

                // Check initial session
                const { data: { session } } = await this.supabase.auth.getSession();
                this.updateAuthState(session);

                // Listen for auth changes
                this.supabase.auth.onAuthStateChange((_event, session) => {
                    this.updateAuthState(session);
                });

            } catch (e) {
                console.error("Supabase init failed", e);
                this.showAuthConfig();
            }
        } else {
            this.showAuthConfig();
        }
    }

    showAuthConfig() {
        document.getElementById('auth-modal').style.display = 'flex';
    }

    updateAuthState(session) {
        this.session = session;
        const authContainer = document.getElementById('auth-container');
        const userActions = document.getElementById('user-actions');

        if (session) {
            authContainer.style.display = 'none';
            userActions.style.display = 'flex';
        } else {
            authContainer.style.display = 'flex';
            userActions.style.display = 'none';
            this.showScreen('login');
        }
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const icon = document.querySelector('#theme-toggle .material-icons');
        if (icon) icon.textContent = this.theme === 'light' ? 'dark_mode' : 'light_mode';
    }

    bindEvents() {
        // Mode Toggles
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.currentTarget.dataset.mode));
        });

        // Search/Translate
        document.getElementById('search-btn').onclick = () => this.performSearch();
        document.getElementById('translate-btn').onclick = () => this.performTranslate();
        document.getElementById('theme-toggle').onclick = () => this.toggleTheme();

        // Auth Form Binders
        document.getElementById('login-form').onsubmit = (e) => this.handleLogin(e);
        document.getElementById('signup-form').onsubmit = (e) => this.handleSignup(e);
        document.getElementById('logout-btn').onclick = () => this.handleLogout();

        document.getElementById('to-signup').onclick = (e) => { e.preventDefault(); this.showScreen('signup'); };
        document.getElementById('to-login').onclick = (e) => { e.preventDefault(); this.showScreen('login'); };

        // Autocomplete
        const searchInput = document.getElementById('search-word');
        searchInput.oninput = (e) => this.handleSuggestions(e.target.value);
        searchInput.onfocus = () => this.handleSuggestions(searchInput.value);
        searchInput.onkeypress = (e) => { if (e.key === 'Enter') this.performSearch(); };

        document.getElementById('swap-languages').onclick = () => this.swapLanguages();

        window.saveConfig = () => {
            const url = document.getElementById('config-url').value.trim();
            const key = document.getElementById('config-key').value.trim();
            if (url && key) {
                localStorage.setItem('sb_url', url);
                localStorage.setItem('sb_key', key);
                location.reload();
            }
        };
    }

    showScreen(screen) {
        const isLogin = screen === 'login';
        document.getElementById('login-form').style.display = isLogin ? 'flex' : 'none';
        document.getElementById('signup-form').style.display = isLogin ? 'none' : 'flex';
        document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Join IndiaDict';
        document.getElementById('auth-subtitle').textContent = isLogin ? 'Log in to your account' : 'Start your linguistic journey';
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        this.showLoading(true);
        const { error } = await this.supabase.auth.signInWithPassword({ email, password });
        this.showLoading(false);

        if (error) alert(error.message);
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        this.showLoading(true);
        const { error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
        this.showLoading(false);

        if (error) alert(error.message);
        else alert("Check your email for confirmation!");
    }

    async handleLogout() {
        this.showLoading(true);
        await this.supabase.auth.signOut();
        this.showLoading(false);
    }

    // Existing Search/Translate logic updated with null checks
    async performSearch() {
        if (!this.supabase || !this.session) return;
        const word = document.getElementById('search-word').value.trim();
        const lang = document.getElementById('search-language').value;
        if (!word) return;

        this.showLoading(true);
        try {
            let { data, error } = await this.supabase
                .from('dictionary')
                .select('*')
                .eq('language', lang)
                .ilike('word', word)
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            if (data) this.renderDictionaryResult(data);
            else this.renderError("Word not found.");
        } catch (e) {
            this.renderError("Connection error.");
        }
        this.showLoading(false);
    }

    async performTranslate() {
        if (!this.supabase || !this.session) return;
        const word = document.getElementById('translate-word').value.trim();
        const src = document.getElementById('source-lang').value;
        const tgt = document.getElementById('target-lang').value;
        if (!word) return;

        this.showLoading(true);
        try {
            const { data, error } = await this.supabase
                .from('dictionary')
                .select('word, translations')
                .eq('language', src)
                .ilike('word', word)
                .maybeSingle();

            if (error) throw error;
            if (data && data.translations && data.translations[tgt]) {
                const targetTranslation = data.translations[tgt];
                this.renderTranslationResult({
                    word: data.word,
                    translation: { word: targetTranslation.word || targetTranslation }
                }, src, tgt);
            } else {
                this.renderError("Translation not found.");
            }
        } catch (e) {
            this.renderError("Sync error.");
        }
        this.showLoading(false);
    }

    renderDictionaryResult(data) {
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('dictionary-result').style.display = 'block';
        document.getElementById('translation-result').style.display = 'none';
        document.getElementById('error-result').style.display = 'none';

        document.getElementById('result-word').textContent = data.word;
        document.getElementById('part-of-speech').textContent = data.part_of_speech || 'noun';
        document.getElementById('definition').textContent = data.definition;
        document.getElementById('pronunciation').textContent = data.pronunciation || '';

        const grid = document.getElementById('translations-grid');
        grid.innerHTML = '';
        if (data.translations) {
            Object.entries(data.translations).forEach(([lang, val]) => {
                const wordText = val.word || val;
                const card = document.createElement('div');
                card.className = 'trans-card';
                card.innerHTML = `<span class="lang-label">${lang}</span><span class="trans-word">${wordText}</span>`;
                grid.appendChild(card);
            });
        }
    }

    renderTranslationResult(data, src, tgt) {
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('dictionary-result').style.display = 'none';
        document.getElementById('translation-result').style.display = 'block';
        document.getElementById('error-result').style.display = 'none';

        document.getElementById('source-word-text').textContent = data.word;
        document.getElementById('source-word-lang').textContent = src;
        document.getElementById('target-word-text').textContent = data.translation.word;
        document.getElementById('target-word-lang').textContent = tgt;
    }

    renderError(msg) {
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('dictionary-result').style.display = 'none';
        document.getElementById('translation-result').style.display = 'none';
        document.getElementById('error-result').style.display = 'block';
        document.getElementById('error-message').textContent = msg;
    }

    async handleSuggestions(q) {
        if (!this.supabase || !this.session || q.length < 2) {
            document.getElementById('suggestions-dropdown').style.display = 'none';
            return;
        }
        const lang = document.getElementById('search-language').value;
        const dd = document.getElementById('suggestions-dropdown');

        try {
            const { data } = await this.supabase
                .from('dictionary')
                .select('word')
                .eq('language', lang)
                .ilike('word', `${q}%`)
                .limit(5);

            if (data && data.length) {
                dd.innerHTML = data.map(s => `<div class="suggestion-item">${s.word}</div>`).join('');
                dd.style.display = 'block';
                dd.querySelectorAll('.suggestion-item').forEach(item => {
                    item.onclick = (e) => {
                        document.getElementById('search-word').value = e.target.textContent;
                        dd.style.display = 'none';
                        this.performSearch();
                    };
                });
            } else {
                dd.style.display = 'none';
            }
        } catch (e) { }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    showLoading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        document.getElementById('dictionary-mode').style.display = mode === 'dictionary' ? 'block' : 'none';
        document.getElementById('translate-mode').style.display = mode === 'translate' ? 'block' : 'none';
        document.getElementById('results-container').style.display = 'none';
    }

    swapLanguages() {
        const s = document.getElementById('source-lang');
        const t = document.getElementById('target-lang');
        const temp = s.value; s.value = t.value; t.value = temp;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new IndiaDict2(); });
