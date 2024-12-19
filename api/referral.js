const cors = require('cors');
require('dotenv').config();
const generateReferralCode = require('./utils/codeGenerator');
const pool = require('./db/database');

const corsMiddleware = cors();

const handler = async (req, res) => {
    console.log('Request received:', req.method, req.url);
    
    // Handle CORS
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => {
            if (result instanceof Error) {
                console.error('CORS Error:', result);
                reject(result);
            }
            resolve(result);
        });
    });

    const { method } = req;
    console.log('Processing method:', method);

    try {
        switch (method) {
            case 'POST':
                // Handle /api/referral/generate
                if (req.url.includes('/generate')) {
                    console.log('Processing generate request');
                    const { walletAddress } = req.body;
                    console.log('Wallet Address received:', walletAddress);
                    
                    if (!walletAddress) {
                        console.error('No wallet address provided');
                        return res.status(400).json({ error: 'Wallet address is required' });
                    }
                    
                    // Generate the referral code
                    console.log('Generating referral code...');
                    const result = generateReferralCode(walletAddress);
                    console.log('Generation result:', result);
                    
                    if (!result.success) {
                        console.error('Code generation failed:', result.error);
                        return res.status(400).json({ error: result.error });
                    }

                    try {
                        // Check if wallet already has a code
                        console.log('Checking for existing code...');
                        const existingCode = await pool.query(
                            'SELECT code FROM referral_codes WHERE wallet_address = $1',
                            [walletAddress]
                        );
                        console.log('Existing code query result:', existingCode.rows);

                        if (existingCode.rows.length > 0) {
                            console.log('Returning existing code');
                            return res.json({ code: existingCode.rows[0].code });
                        }

                        // Store new code in database
                        console.log('Storing new code...');
                        const newCode = await pool.query(
                            'INSERT INTO referral_codes (code, wallet_address) VALUES ($1, $2) RETURNING code',
                            [result.code, walletAddress]
                        );
                        console.log('New code stored:', newCode.rows[0]);

                        return res.json({ code: newCode.rows[0].code });
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        return res.status(500).json({ error: 'Database error: ' + dbError.message });
                    }
                }
                break;

            case 'GET':
                // Handle /api/referral/verify/[code]
                if (req.url.includes('/verify/')) {
                    console.log('Processing verify request');
                    const code = req.url.split('/verify/')[1];
                    console.log('Verifying code:', code);
                    
                    if (!code) {
                        console.error('No code provided');
                        return res.status(400).json({ error: 'Code is required' });
                    }
                    
                    try {
                        const result = await pool.query(
                            'SELECT * FROM referral_codes WHERE code = $1',
                            [code]
                        );
                        console.log('Verification result:', result.rows);

                        if (result.rows.length === 0) {
                            console.log('Invalid code');
                            return res.status(404).json({ error: 'Invalid referral code' });
                        }

                        console.log('Code verified successfully');
                        return res.json({ valid: true, walletAddress: result.rows[0].wallet_address });
                    } catch (dbError) {
                        console.error('Database error during verification:', dbError);
                        return res.status(500).json({ error: 'Database error: ' + dbError.message });
                    }
                }
                break;

            default:
                console.log('Method not allowed:', method);
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};

module.exports = handler;