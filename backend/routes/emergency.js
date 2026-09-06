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
            privateKey:
                process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
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
                message:
                    'No phone is registered for SOS notifications.'
            });
        }


        // =================================================
        // GET DEPARTMENT FROM OFFICER REQUEST
        // =================================================

        const department =
            req.body.department ||
            'District Administration';


        const source =
            req.body.source ||
            'District Control Room';


        const location =
            req.body.location ||
            'Mandakini Micro-Catchment, Rudraprayag, Uttarakhand';


        const riskLevel =
            req.body.riskLevel ||
            'UNKNOWN';


        // =================================================
        // NOTIFICATION CONTENT
        // =================================================

        const notificationTitle =
            '🚨 AquaSentinel SOS Alert';


        const notificationBody =
            `Sent by: ${department}. Emergency SOS has been activated from the ${source}.`;


        const tokens =
            Array.from(pushTokens);


        // =================================================
        // FCM MESSAGE
        // =================================================

        const message = {

            notification: {

                title:
                    notificationTitle,

                body:
                    notificationBody

            },


            data: {

                type:
                    'SOS',

                department:
                    String(department),

                source:
                    String(source),

                location:
                    String(location),

                riskLevel:
                    String(riskLevel),

                route:
                    '/emergency'

            },


            webpush: {

                notification: {

                    title:
                        notificationTitle,

                    body:
                        notificationBody,

                    icon:
                        '/favicon.ico',

                    data: {

                        type:
                            'SOS',

                        department:
                            String(department),

                        source:
                            String(source),

                        location:
                            String(location),

                        riskLevel:
                            String(riskLevel),

                        route:
                            '/emergency'

                    }

                },


                fcmOptions: {

                    link:
                        '/emergency'

                }

            }

        };


        // =================================================
        // SEND TO ALL REGISTERED PHONES
        // =================================================

        const response =
            await getMessaging()
                .sendEachForMulticast({

                    tokens,

                    ...message

                });


        console.log(
            `SOS notification sent: ${response.successCount} successful, ${response.failureCount} failed`
        );


        console.log(
            `SOS sent by department: ${department}`
        );


        // =================================================
        // REMOVE INVALID TOKENS
        // =================================================

        response.responses.forEach(
            (result, index) => {

                if (!result.success) {

                    const errorCode =
                        result.error?.code || '';


                    if (
                        errorCode.includes(
                            'registration-token-not-registered'
                        ) ||
                        errorCode.includes(
                            'invalid-registration-token'
                        )
                    ) {

                        pushTokens.delete(
                            tokens[index]
                        );


                        console.log(
                            'Removed invalid FCM token from registered devices.'
                        );

                    }

                }

            }
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.json({

            success:
                true,

            message:
                'SOS notification sent.',

            sent:
                response.successCount,

            failed:
                response.failureCount,

            department:
                department

        });

    } catch (error) {

        console.error(
            'Firebase SOS notification error:',
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                'Failed to send SOS notification.',

            error:
                error.message

        });

    }

});


module.exports = router;