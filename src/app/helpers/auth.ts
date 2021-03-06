export function getToken(): string|null {
  return localStorage.getItem('token');
}

export function saveAuth(token: string, profile?: auth0.Auth0UserProfile) {
  localStorage.setItem('token', token);
  if (profile) {
    localStorage.setItem('profile', JSON.stringify(profile));
  }
}

export function clearAuth() {
  localStorage.clear();
}

function getDecodedToken() {
  const token = getToken();

  const urlBase64Decode = (str) => {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {
        throw new Error('Illegal base64url string!');
      }
    }
    return decodeURIComponent(encodeURIComponent(atob(output)));
  };

  const decodeToken = (jwt) => {
    const parts = jwt.split('.');

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts');
    }

    const decoded = urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('Cannot decode the token');
    }

    return JSON.parse(decoded);
  };

  if (token === undefined || token === null) {
    return null;
  }
  try {
    return decodeToken(token);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function getExpiryDate(): Date|null {
  const decoded = getDecodedToken();
  if (decoded === null || decoded.exp === undefined) {
    return null;
  }
  return new Date(decoded.exp * 1000);
}

export function getUserID(): string|null {
  const storedProfile = localStorage.getItem('profile');
  if (storedProfile === null) {
    return null;
  }
  const profile: auth0.Auth0UserProfile = JSON.parse(storedProfile);
  return profile.user_id;
}
