const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: DiscordStrategy } = require('passport-discord');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const playerRoutes = require('./routes/player');
const socketManager = require('../utils/socketManager');

const app = express();
const server = http.createServer(app);

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = [DASHBOARD_URL, 'http://localhost:3000', 'http://localhost:3001', 'https://spacebot.me', 'http://spacebot.me'];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true
    }
});

module.exports = (client) => {
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    const MongoStore = require('connect-mongo').default || require('connect-mongo');
    const mongoose = require('mongoose');

    const isProduction = process.env.NODE_ENV === 'production';

    const sessionMiddleware = session({
        store: MongoStore.create({ 
            client: mongoose.connection.getClient(),
            ttl: 30 * 24 * 60 * 60
        }),
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: isProduction,
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            domain: isProduction ? '.spacebot.me' : undefined
        }
    });

    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    socketManager.init(client, io);

    io.on('connection', (socket) => {
        console.log('[Socket.IO] Client connected:', socket.id);

        socket.on('join:guild', (guildId) => {
            socket.join(guildId);
        });

        socket.on('leave:guild', (guildId) => {
            socket.leave(guildId);
        });

        socket.on('disconnect', () => {
            console.log('[Socket.IO] Client disconnected:', socket.id);
        });
    });

    app.use('/auth', authRoutes);
    app.use('/api', apiRoutes(client));
    app.use('/api/player', playerRoutes(client, io));

    const clientBuildPath = path.join(__dirname, 'client', 'build');
    const indexHtml = path.join(clientBuildPath, 'index.html');
    const fs = require('fs');
    if (!fs.existsSync(indexHtml)) {
        console.warn('[Dashboard] No client build at', indexHtml, '- run: cd src/web/client && npm run build');
    }
    app.use(express.static(clientBuildPath));
    // SPA fallback: path '/' only (Express 5/path-to-regexp v8 reject '/*')
    app.use('/', (req, res, next) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
            return res.sendFile(indexHtml, (err) => {
                if (err) {
                    console.error('[Dashboard] sendFile index.html failed:', err.message);
                    res.status(503).send('Dashboard build not found. Run: cd src/web/client && npm run build');
                }
            });
        }
        next();
    });

    // Must be last: catch unhandled errors so we don't return 500 without logging
    app.use((err, req, res, next) => {
        console.error('[Dashboard] Unhandled error:', err);
        res.status(500).send('Internal Server Error');
    });

    client.dashboardIO = io;

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Dashboard running on port ${PORT}`);
        console.log(`Dashboard URL: ${DASHBOARD_URL}`);
    });
};
