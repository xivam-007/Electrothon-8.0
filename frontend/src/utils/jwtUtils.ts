interface decodedToken {
    id: string | null;
    name: string | null;
    phone: string | null;
    exp: number;
    email: string | null;
}

function decodeJWT(token: string): decodedToken | null {
  try {
    const base64Payload = token.split('.')[1];
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    return {
      name: payload.name || null,
      id: payload.id || null,
      phone: payload.phone || null,
      exp: payload.exp,
      email: payload.email || null
    };
  } catch {
    return null;
  }
}

export function validateToken(token: string): {id:string | null, name:string | null, phone:string | null, isValid: boolean, isExpired: boolean, decoded: decodedToken | null} {
    const decoded = decodeJWT(token);
    if (decoded) {
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = decoded.exp < currentTime;
        return { id: decoded.id || null, name: decoded.name || null, phone: decoded.phone || null, isValid: !isExpired, isExpired, decoded };
    }
    return { id: null, name: null, phone: null, isValid: false, isExpired: true, decoded: null };
}   

export function clearExpiredToken() {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
            localStorage.removeItem('token');
        }
    }
}