async function testAPI() {
  try {
      const response = await fetch('/api/test');
      const data = await response.json();
      console.log('Test response:', data);
  } catch (error) {
      console.error('Test error:', error);
  }
}

window.addEventListener('load', testAPI);

async function testBackendConnection() {
  try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            walletAddress: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
        })
    });
    const data = await response.json();
    console.log('Backend response:', data);
} catch (error) {
    console.error('Connection error:', error);
}
}

// Call it when the page loads
window.addEventListener('load', testBackendConnection);

const getStartedButton = document.querySelector('.poly-button.inline-block');
if (getStartedButton) {
    getStartedButton.setAttribute('onclick', 'openModal()');
    getStartedButton.removeAttribute('href');
}

  function openModal() {
    document.getElementById('codeModal').style.display = 'block';
  }

  function closeModal() {
    document.getElementById('codeModal').style.display = 'none';
    document.getElementById('codeContainer').style.display = 'none';
    document.getElementById('walletAddress').value = '';
    document.getElementById('copySuccess').style.display = 'none';
  }

  function isValidSolanaAddress(address) {
    try {
      const publicKey = new solanaWeb3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async function generateCode() {
    const walletAddress = document.getElementById('walletAddress').value.trim();
    if (!walletAddress) {
      alert('Please enter a wallet address');
      return;
    }
    if (!isValidSolanaAddress(walletAddress)) {
      alert('Please enter a valid Solana wallet address');
      return;
    }

    try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({walletAddress})
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      document.getElementById('displayWallet').textContent = walletAddress;
      document.getElementById('codeDisplay').textContent = data.code;
      document.getElementById('codeContainer').style.display = 'block';
      document.getElementById('copySuccess').style.display = 'none';
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating referral code. Please try again.');
    }
  }

  async function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    try {
      await navigator.clipboard.writeText(code);
      const copySuccess = document.getElementById('copySuccess');
      copySuccess.style.display = 'block';
      setTimeout(() => {
        copySuccess.style.display = 'none';
      }, 2000);
    } catch (err) {
      alert('Failed to copy code. Please try manually selecting and copying.');
    }
  }

  window.onclick = function (event) {
    if (event.target == document.getElementById('codeModal')) {
      closeModal();
    }
  }