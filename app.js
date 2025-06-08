// Password Complexity Checker Application
class PasswordChecker {
    constructor() {
        this.commonPasswords = [
            "password", "123456", "123456789", "qwerty", "abc123", "password1", 
            "admin", "letmein", "welcome", "monkey", "1234567890", "password123",
            "123123", "111111", "1234567", "sunshine", "password1234", "princess",
            "azerty", "trustno1", "000000", "12345678"
        ];
        
        this.keyboardPatterns = [
            "qwerty", "qwertyuiop", "asdf", "asdfgh", "zxcv", "zxcvbn", 
            "123456", "1234567890", "abcdef", "fedcba"
        ];
        
        this.strengthLevels = {
            very_weak: {min: 0, max: 20, color: "#ff4444", label: "Very Weak"},
            weak: {min: 21, max: 40, color: "#ff8800", label: "Weak"},
            fair: {min: 41, max: 60, color: "#ffbb00", label: "Fair"},
            good: {min: 61, max: 80, color: "#88cc00", label: "Good"},
            strong: {min: 81, max: 95, color: "#00cc44", label: "Strong"},
            excellent: {min: 96, max: 100, color: "#0088ff", label: "Excellent"}
        };
        
        this.criteria = [
            {id: "length_8", label: "At least 8 characters", points: 10},
            {id: "length_12", label: "At least 12 characters (recommended)", points: 15},
            {id: "length_20", label: "20+ characters (excellent)", points: 20},
            {id: "lowercase", label: "Contains lowercase letters", points: 8},
            {id: "uppercase", label: "Contains uppercase letters", points: 8},
            {id: "numbers", label: "Contains numbers", points: 8},
            {id: "special", label: "Contains special characters", points: 12},
            {id: "variety", label: "Good character variety", points: 10},
            {id: "no_common", label: "Not a common password", points: 15},
            {id: "no_patterns", label: "No obvious patterns", points: 10}
        ];
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.renderCriteria();
        this.updateAnalysis('');
    }
    
    bindElements() {
        this.passwordInput = document.getElementById('password-input');
        this.passwordToggle = document.getElementById('password-toggle');
        this.strengthLevel = document.getElementById('strength-level');
        this.strengthBar = document.getElementById('strength-bar');
        this.scoreDisplay = document.getElementById('score-display');
        this.criteriaList = document.getElementById('criteria-list');
        this.entropyDisplay = document.getElementById('entropy-display');
        this.crackTimeDisplay = document.getElementById('crack-time-display');
        this.varietyDisplay = document.getElementById('variety-display');
        this.suggestionsCard = document.getElementById('suggestions-card');
        this.suggestionsList = document.getElementById('suggestions-list');
        this.generateBtn = document.getElementById('generate-password');
        this.copyBtn = document.getElementById('copy-password');
        this.clearBtn = document.getElementById('clear-password');
        
        // Debug: Check if elements are found
        console.log('Elements bound:', {
            passwordInput: !!this.passwordInput,
            strengthLevel: !!this.strengthLevel,
            strengthBar: !!this.strengthBar
        });
    }
    
    bindEvents() {
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', (e) => {
                console.log('Password input changed:', e.target.value.length, 'characters');
                this.updateAnalysis(e.target.value);
            });
        }
        
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }
        
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => {
                this.generatePassword();
            });
        }
        
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                this.copyPassword();
            });
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearPassword();
            });
        }
    }
    
    renderCriteria() {
        if (!this.criteriaList) return;
        
        this.criteriaList.innerHTML = this.criteria.map(criterion => `
            <div class="criterion" id="criterion-${criterion.id}">
                <div class="criterion-icon criterion-icon--unmet">✗</div>
                <div class="criterion-text">${criterion.label}</div>
                <div class="criterion-points">+${criterion.points}pts</div>
            </div>
        `).join('');
    }
    
    updateAnalysis(password) {
        console.log('Updating analysis for password of length:', password.length);
        const analysis = this.analyzePassword(password);
        console.log('Analysis result:', analysis);
        
        this.updateStrengthMeter(analysis);
        this.updateCriteria(analysis);
        this.updateMetrics(analysis);
        this.updateSuggestions(analysis);
        
        if (this.copyBtn) {
            this.copyBtn.disabled = !password;
        }
    }
    
    analyzePassword(password) {
        if (!password) {
            return {
                score: 0,
                strength: 'very_weak',
                criteria: {
                    length_8: false,
                    length_12: false,
                    length_20: false,
                    lowercase: false,
                    uppercase: false,
                    numbers: false,
                    special: false,
                    variety: false,
                    no_common: true,
                    no_patterns: true
                },
                entropy: 0,
                crackTime: 'Instant',
                variety: 'None',
                suggestions: ['Enter a password to begin analysis']
            };
        }
        
        const analysis = {
            length: password.length,
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
            hasRepeated: this.hasRepeatedChars(password),
            hasSequential: this.hasSequentialChars(password),
            hasKeyboardPattern: this.hasKeyboardPattern(password),
            isCommon: this.isCommonPassword(password),
            entropy: this.calculateEntropy(password)
        };
        
        const score = this.calculateScore(password, analysis);
        const strength = this.getStrengthLevel(score);
        const criteria = this.evaluateCriteria(password, analysis);
        const variety = this.getCharacterVariety(analysis);
        const crackTime = this.estimateCrackTime(analysis.entropy);
        const suggestions = this.generateSuggestions(password, analysis);
        
        return {
            score,
            strength,
            criteria,
            entropy: analysis.entropy,
            crackTime,
            variety,
            suggestions
        };
    }
    
    calculateScore(password, analysis) {
        let score = 0;
        
        // Length scoring
        if (password.length >= 8) score += 10;
        if (password.length >= 12) score += 15;
        if (password.length >= 20) score += 20;
        else if (password.length >= 16) score += 10;
        
        // Character variety
        if (analysis.hasLower) score += 8;
        if (analysis.hasUpper) score += 8;
        if (analysis.hasNumber) score += 8;
        if (analysis.hasSpecial) score += 12;
        
        // Variety bonus
        const charTypes = [analysis.hasLower, analysis.hasUpper, analysis.hasNumber, analysis.hasSpecial].filter(Boolean).length;
        if (charTypes >= 3) score += 10;
        
        // Pattern penalties
        if (analysis.hasRepeated) score -= 10;
        if (analysis.hasSequential) score -= 15;
        if (analysis.hasKeyboardPattern) score -= 20;
        
        // Common password penalty
        if (analysis.isCommon) score -= 50;
        
        return Math.max(0, Math.min(100, score));
    }
    
    hasRepeatedChars(password) {
        return /(.)\1{2,}/.test(password);
    }
    
    hasSequentialChars(password) {
        const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', '9876543210', 'zyxwvutsrqponmlkjihgfedcba'];
        const lower = password.toLowerCase();
        
        for (let seq of sequences) {
            for (let i = 0; i <= seq.length - 3; i++) {
                if (lower.includes(seq.substr(i, 3))) {
                    return true;
                }
            }
        }
        return false;
    }
    
    hasKeyboardPattern(password) {
        const lower = password.toLowerCase();
        return this.keyboardPatterns.some(pattern => lower.includes(pattern));
    }
    
    isCommonPassword(password) {
        return this.commonPasswords.includes(password.toLowerCase());
    }
    
    calculateEntropy(password) {
        if (!password) return 0;
        
        let charset = 0;
        if (/[a-z]/.test(password)) charset += 26;
        if (/[A-Z]/.test(password)) charset += 26;
        if (/[0-9]/.test(password)) charset += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
        
        return Math.round(password.length * Math.log2(charset));
    }
    
    getStrengthLevel(score) {
        for (let [key, level] of Object.entries(this.strengthLevels)) {
            if (score >= level.min && score <= level.max) {
                return key;
            }
        }
        return 'very_weak';
    }
    
    evaluateCriteria(password, analysis) {
        return {
            length_8: password.length >= 8,
            length_12: password.length >= 12,
            length_20: password.length >= 20,
            lowercase: analysis.hasLower,
            uppercase: analysis.hasUpper,
            numbers: analysis.hasNumber,
            special: analysis.hasSpecial,
            variety: [analysis.hasLower, analysis.hasUpper, analysis.hasNumber, analysis.hasSpecial].filter(Boolean).length >= 3,
            no_common: !analysis.isCommon,
            no_patterns: !analysis.hasRepeated && !analysis.hasSequential && !analysis.hasKeyboardPattern
        };
    }
    
    getCharacterVariety(analysis) {
        const types = [];
        if (analysis.hasLower) types.push('lowercase');
        if (analysis.hasUpper) types.push('uppercase');
        if (analysis.hasNumber) types.push('numbers');
        if (analysis.hasSpecial) types.push('symbols');
        
        return types.length ? types.join(', ') : 'None';
    }
    
    estimateCrackTime(entropy) {
        if (entropy === 0) return 'Instant';
        
        const guessesPerSecond = 1e9; // 1 billion guesses per second
        const possiblePasswords = Math.pow(2, entropy);
        const averageGuesses = possiblePasswords / 2;
        const secondsToCrack = averageGuesses / guessesPerSecond;
        
        if (secondsToCrack < 1) return 'Instant';
        if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
        if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
        if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
        if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
        if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
        
        return 'Centuries';
    }
    
    generateSuggestions(password, analysis) {
        const suggestions = [];
        
        if (password.length < 8) suggestions.push('Use at least 8 characters');
        if (password.length < 12) suggestions.push('Consider using 12+ characters for better security');
        if (!analysis.hasLower) suggestions.push('Add lowercase letters (a-z)');
        if (!analysis.hasUpper) suggestions.push('Add uppercase letters (A-Z)');
        if (!analysis.hasNumber) suggestions.push('Include numbers (0-9)');
        if (!analysis.hasSpecial) suggestions.push('Use special characters (!@#$%^&*)');
        if (analysis.hasRepeated) suggestions.push('Avoid repeated characters (aaa, 111)');
        if (analysis.hasSequential) suggestions.push('Avoid sequential patterns (123, abc)');
        if (analysis.hasKeyboardPattern) suggestions.push('Avoid keyboard patterns (qwerty, asdf)');
        if (analysis.isCommon) suggestions.push('This is a commonly used password - choose something unique');
        
        return suggestions;
    }
    
    updateStrengthMeter(analysis) {
        const level = this.strengthLevels[analysis.strength];
        const percentage = analysis.score;
        
        if (this.strengthLevel) {
            this.strengthLevel.textContent = level ? level.label : 'Enter a password';
            this.strengthLevel.className = `strength-level strength-${analysis.strength}`;
        }
        
        if (this.strengthBar) {
            this.strengthBar.style.width = `${percentage}%`;
            this.strengthBar.className = `strength-bar strength-bar--${analysis.strength}`;
        }
        
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = analysis.score;
        }
    }
    
    updateCriteria(analysis) {
        Object.entries(analysis.criteria).forEach(([key, met]) => {
            const element = document.getElementById(`criterion-${key}`);
            if (element) {
                const icon = element.querySelector('.criterion-icon');
                element.className = `criterion criterion--${met ? 'met' : 'unmet'}`;
                icon.className = `criterion-icon criterion-icon--${met ? 'met' : 'unmet'}`;
                icon.textContent = met ? '✓' : '✗';
            }
        });
    }
    
    updateMetrics(analysis) {
        if (this.entropyDisplay) {
            this.entropyDisplay.textContent = `${analysis.entropy} bits`;
        }
        if (this.crackTimeDisplay) {
            this.crackTimeDisplay.textContent = analysis.crackTime;
        }
        if (this.varietyDisplay) {
            this.varietyDisplay.textContent = analysis.variety;
        }
    }
    
    updateSuggestions(analysis) {
        if (!this.suggestionsCard || !this.suggestionsList) return;
        
        if (analysis.suggestions.length > 0) {
            this.suggestionsList.innerHTML = analysis.suggestions
                .map(suggestion => `<div class="suggestion">${suggestion}</div>`)
                .join('');
            this.suggestionsCard.style.display = 'block';
        } else {
            this.suggestionsCard.style.display = 'none';
        }
    }
    
    togglePasswordVisibility() {
        if (!this.passwordInput || !this.passwordToggle) return;
        
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        const icon = this.passwordToggle.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = isPassword ? '🙈' : '👁️';
        }
    }
    
    generatePassword() {
        if (!this.passwordInput) return;
        
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        
        // Ensure at least one character from each category
        const categories = [
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 
            '0123456789',
            '!@#$%^&*()_+-=[]{}|;:,.<>?'
        ];
        
        // Add one character from each category
        categories.forEach(category => {
            password += category.charAt(Math.floor(Math.random() * category.length));
        });
        
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle the password
        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        
        this.passwordInput.value = password;
        this.updateAnalysis(password);
        
        console.log('Generated password:', password);
    }
    
    async copyPassword() {
        if (!this.passwordInput || !this.copyBtn) return;
        
        const password = this.passwordInput.value;
        if (!password) return;
        
        try {
            await navigator.clipboard.writeText(password);
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.disabled = true;
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.disabled = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy password:', err);
            // Fallback for older browsers
            this.passwordInput.select();
            document.execCommand('copy');
            
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.disabled = true;
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.disabled = false;
            }, 2000);
        }
    }
    
    clearPassword() {
        if (!this.passwordInput) return;
        
        this.passwordInput.value = '';
        this.passwordInput.type = 'password';
        const icon = this.passwordToggle?.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = '👁️';
        }
        this.updateAnalysis('');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing PasswordChecker');
    new PasswordChecker();
});