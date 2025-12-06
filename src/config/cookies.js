const setAuthTokenAndUid = (token, uid) => {
  try {
    const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour from now

    document.cookie = `authToken=${token}; expires=${new Date(
      expiryTime
    ).toUTCString()}; path=/`;
    document.cookie = `uid=${uid}; expires=${new Date(
      expiryTime
    ).toUTCString()}; path=/`;
  } catch {
    // ignore cookie setting errors
  }
};

const fetchAuthTokenAndUid = () => {
  try {
    const getCookieValue = (name) => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? match[2] : null;
    };

    const authToken = getCookieValue("authToken");
    const uid = getCookieValue("uid");

    return { authToken, uid };
  } catch {
    return { authToken: null, uid: null };
  }
};

export { setAuthTokenAndUid, fetchAuthTokenAndUid };
