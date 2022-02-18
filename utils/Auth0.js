import * as SecureStore from 'expo-secure-store';
import getEnvVars from '../environment';
import * as AuthSession from 'expo-auth-session';

const { auth0Domain, auth0ClientId, apiUrl, audience } = getEnvVars();

export default {
    login: async () => {
        const redirectUrl = AuthSession.makeRedirectUri();
        let authUrl = `${auth0Domain}/authorize?client_id=${auth0ClientId}&audience=${audience}&response_type=code&scope=openid%20profile%20email%20offline_access&redirect_uri=${redirectUrl}`
        console.log(`Redirect URL (add this to Auth0): ${redirectUrl}`);
        console.log(`AuthURL is : ${authUrl}`);
        const result = await AuthSession.startAsync({
        authUrl
        });
        if (result.type === 'success') {
            console.log(result.params.code);
            const auth0Response = await fetch(`${apiUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'code': result.params.code,
                    'redirect_uri': redirectUrl
                })
            })

            const tokens = await auth0Response.json();

            SecureStore.setItemAsync('access_token', tokens.access_token)
            SecureStore.setItemAsync('refresh_token', tokens.refresh_token)
        }
    },
    getUser: async () => {
        const accessToken = await SecureStore.getItemAsync('access_token');
        const refreshToken = await SecureStore.getItemAsync('refresh_token');

        console.log(accessToken);
        console.log(refreshToken);
    }
}