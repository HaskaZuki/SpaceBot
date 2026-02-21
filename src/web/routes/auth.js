const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../../models/User');
const UserSettings = require('../../models/UserSettings');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';

router.get('/login', passport.authenticate('discord'));
router.get('/discord', passport.authenticate('discord'));

router.get('/callback', (req, res, next) => {
    passport.authenticate('discord', (err, user, info) => {
        if (err) {
            console.error('OAuth error:', err.message);
            if (err.message && err.message.includes('rate limit')) {
                return res.status(429).send(`
                    <html><body style="background:#1a1a2e;color:#fff;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">
                        <div><h2>⏳ Too Many Login Attempts</h2><p>Discord is rate limiting requests. Please wait a moment and try again.</p>
                        <a href="${DASHBOARD_URL}/auth/discord" style="color:#5865F2;margin-top:1rem;display:inline-block">Try Again</a></div>
                    </body></html>
                `);
            }
            return res.redirect(`${DASHBOARD_URL}/`);
        }
        if (!user) return res.redirect(`${DASHBOARD_URL}/`);
        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            return res.redirect(`${DASHBOARD_URL}/dashboard`);
        });
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(`${DASHBOARD_URL}/`);
    });
});

router.get('/user', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    
    if (!req.user) return res.json(null);
    
    try {
        let dbUser = await User.findOne({ userId: req.user.id });
        if (!dbUser) {
            dbUser = await User.create({ userId: req.user.id });
        }

        let userSettings = await UserSettings.findOne({ userId: req.user.id });
        if (!userSettings) {
            userSettings = await UserSettings.create({
                userId: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar
            });
        }

        const now = new Date();
        const isPremiumActive = userSettings.isPremium && 
            (!userSettings.premiumExpiresAt || userSettings.premiumExpiresAt > now);

        if (userSettings.isPremium && userSettings.premiumExpiresAt && userSettings.premiumExpiresAt <= now) {
            userSettings.isPremium = false;
            await userSettings.save();
        }

        const userData = {
            ...req.user,
            isPremium: isPremiumActive,
            premiumExpiresAt: userSettings.premiumExpiresAt,
            maxPlaylists: isPremiumActive ? 100 : 3,
            maxQueueSize: isPremiumActive ? 500 : 50,
            canUseFilters: isPremiumActive,
            canControlVolume: isPremiumActive,
            memberSince: userSettings.createdAt
        };

        res.json(userData);
    } catch (err) {
        console.error('Auth user error:', err);
        res.json({ ...req.user, isPremium: false });
    }
});

module.exports = router;
