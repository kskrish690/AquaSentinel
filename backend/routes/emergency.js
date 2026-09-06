const express = require('express');

const {
    getApps,
    initializeApp,
    cert
} = require('firebase-admin/app');

const {
    getMessaging
} = require('firebase-admin/messaging');

const router = express.Router();


// =====================================================
// FIREBASE ADMIN INITIALIZATION
// =====================================================

if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
}


// =====================================================
// STORE REGISTERED PHONE TOKENS
// =====================================================

const pushTokens = new Set();


// =====================================================
// REGISTER PHONE PUSH TOKEN
// =====================================================

router.post('/push/register', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'FCM token is required.'
        });
    }

    pushTokens.add(token);

    console.log(
        `FCM phone registered successfully. Total devices: ${pushTokens.size}`
    );

    return res.json({
        success: true,
        message: 'Phone notification registered successfully.'
    });
});


// =====================================================
// SEND SOS PUSH NOTIFICATION
// =====================================================

router.post('/push/sos', async (req, res) => {
    try {
        if (pushTokens.size === 0) {
            return res.status(400).json({
                success: false,
                message: 'No phone is registered for SOS notifications.'
            });
        }

        const tokens = Array.from(pushTokens);

        const message = {
            notification: {
                title: '🚨 AquaSentinel SOS Alert',
                body:
                    'Emergency SOS has been activated from the District Control Room.'
            },

            data: {
                type: 'SOS',
                route: '/emergency'
            },

            webpush: {
                notification: {
                    title: '🚨 AquaSentinel SOS Alert',
                    body:
                        'Emergency SOS has been activated from the District Control Room.',
                    icon: '/favicon.ico'
                },

                fcmOptions: {
                    link: '/emergency'
                }
            }
        };


        // =================================================
        // SEND TO ALL REGISTERED PHONES
        // =================================================

        const response = await getMessaging().sendEachForMulticast({
            tokens,
            ...message
        });


        console.log(
            `SOS notification sent: ${response.successCount} successful, ${response.failureCount} failed`
        );


        // =================================================
        // REMOVE INVALID TOKENS
        // =================================================

        response.responses.forEach((result, index) => {
            if (!result.success) {
                const errorCode = result.error?.code || '';

                if (
                    errorCode.includes('registration-token-not-registered') ||
                    errorCode.includes('invalid-registration-token')
                ) {
                    pushTokens.delete(tokens[index]);

                    console.log(
                        'Removed invalid FCM token from registered devices.'
                    );
                }
            }
        });


        return res.json({
            success: true,
            message: 'SOS notification sent.',
            sent: response.successCount,
            failed: response.failureCount
        });

    } catch (error) {

        console.error(
            'Firebase SOS notification error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to send SOS notification.',
            error: error.message
        });
    }
});


module.exports = router;