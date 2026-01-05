// New handleGoogleSignIn function
function handleGoogleSignIn(response) {
    // Decode JWT token to get user info
    const payload = parseJwt(response.credential);

    currentUser = {
        uid: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified
    };

    console.log('✅ User signed in:', currentUser.name);

    // Check if user has complete profile in database
    if (db) {
        const userRef = db.ref('users/' + currentUser.uid);
        userRef.once('value').then(snapshot => {
            localStorage.setItem('googleUser', JSON.stringify(currentUser));

            if (!snapshot.exists()) {
                // New user - show registration form
                console.log('🆕 New user - showing registration form');
                setTimeout(() => {
                    const nameInput = document.getElementById('fullName');
                    if (nameInput) nameInput.value = currentUser.name;
                }, 100);
                document.getElementById('view-landing')?.classList.remove('active');
                document.getElementById('view-login')?.classList.add('active');
            } else {
                // Existing user - check if profile is complete
                const userData = snapshot.val();
                if (!userData.phone || !userData.address) {
                    // Incomplete profile
                    console.log('⚠️ Incomplete profile - showing form');
                    setTimeout(() => {
                        if (userData.name) document.getElementById('fullName').value = userData.name;
                        if (userData.phone) document.getElementById('whatsapp').value = userData.phone;
                        if (userData.address) document.getElementById('areaSearch').value = userData.address;
                        if (userData.landmark) document.getElementById('landmark').value = userData.landmark;
                    }, 100);
                    document.getElementById('view-landing')?.classList.remove('active');
                    document.getElementById('view-login')?.classList.add('active');
                } else {
                    // Complete profile - go to home
                    console.log('✅ Profile complete');
                    localStorage.setItem('laundryUser', JSON.stringify(userData));
                    if (typeof globalNav !== 'undefined' && globalNav.loadUserData) {
                        globalNav.loadUserData(userData);
                    }
                    document.getElementById('view-landing')?.classList.remove('active');
                    document.getElementById('view-login')?.classList.remove('active');
                    document.getElementById('view-home')?.classList.add('active');
                    if (typeof ordersApp !== 'undefined') ordersApp.init();
                }
            }
        }).catch(error => {
            console.error('❌ Database error:', error);
        });
    }

    // Hide One Tap prompt
    document.getElementById('g_id_onload')?.remove();
}
