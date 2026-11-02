(() => {
    const iterations = 310_000;
    const encoder = new TextEncoder();

    const encodeBytes = bytes => {
        let binary = '';
        bytes.forEach(byte => { binary += String.fromCharCode(byte); });
        return btoa(binary);
    };

    const decodeBytes = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));

    const derivePasswordHash = async (password, salt) => {
        if (!window.crypto?.subtle) {
            throw new Error('Secure browser cryptography is unavailable. Open this site through localhost or HTTPS.');
        }
        const key = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await window.crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256'
        }, key, 256);
        return new Uint8Array(bits);
    };

    const readAccount = () => {
        const saved = localStorage.getItem('studyPlannerUser');
        if (!saved) return { account: null, legacyPasswordRemoved: false };

        const account = JSON.parse(saved);
        if (!account || typeof account !== 'object' || Array.isArray(account)) {
            return { account: null, legacyPasswordRemoved: false };
        }
        const legacyPasswordRemoved = Object.prototype.hasOwnProperty.call(account, 'password');
        if (legacyPasswordRemoved) {
            delete account.password;
            localStorage.setItem('studyPlannerUser', JSON.stringify(account));
        }
        return { account, legacyPasswordRemoved };
    };

    const createAccount = async ({ fullName, email, password }) => {
        const { account: existing } = readAccount();
        if (existing?.email?.toLowerCase() === email.toLowerCase()) {
            throw new Error('A local account already uses this email. Sign in instead.');
        }
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const passwordHash = await derivePasswordHash(password, salt);
        const account = {
            fullName,
            email,
            passwordSalt: encodeBytes(salt),
            passwordHash: encodeBytes(passwordHash),
            passwordIterations: iterations,
            authMode: 'local-browser-demo'
        };
        localStorage.setItem('studyPlannerUser', JSON.stringify(account));
        return account;
    };

    const verifyPassword = async (email, password) => {
        const { account, legacyPasswordRemoved } = readAccount();
        if (typeof account?.email !== 'string' || account.email.toLowerCase() !== email.toLowerCase()) {
            return { valid: false, legacyPasswordRemoved };
        }
        if (!account.passwordHash || !account.passwordSalt) {
            return { valid: false, legacyPasswordRemoved: true };
        }

        const salt = decodeBytes(account.passwordSalt);
        const expected = decodeBytes(account.passwordHash);
        const actual = await derivePasswordHash(password, salt);
        let difference = expected.length ^ actual.length;
        const length = Math.max(expected.length, actual.length);
        for (let index = 0; index < length; index += 1) {
            difference |= (expected[index] || 0) ^ (actual[index] || 0);
        }
        return { valid: difference === 0, legacyPasswordRemoved };
    };

    window.StudyPlannerAuth = { readAccount, createAccount, verifyPassword };
})();