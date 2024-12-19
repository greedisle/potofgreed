const { PublicKey } = require('@solana/web3.js');

function generateReferralCode(walletAddress) {
    try {
        // Validate the wallet address
        new PublicKey(walletAddress);
        
        // Get first 4 and last 4 characters
        const firstFour = walletAddress.slice(0, 4);
        const lastFour = walletAddress.slice(-4);
        
        // Combine with GREED in the middle
        const referralCode = `${firstFour}-GREED-${lastFour}`;
        
        console.log('Generated code:', referralCode);
        console.log('Code length:', referralCode.length);
        
        return {
            success: true,
            code: referralCode
        };
    } catch (error) {
        return {
            success: false,
            error: 'Invalid Solana wallet address'
        };
    }
}

module.exports = generateReferralCode;