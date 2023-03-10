import { createMatrixClient } from "@/js/common/utils";
import {
  MATRIX_DOMAIN,
  MATRIX_LOGIN_LOCAL_STORAGE_KEY,
} from "@/js/common/consts";

async function onLoginSubmit(e) {
  e.preventDefault();
  const inputElems = e.target.elements;
  const username = inputElems.username.value;
  const password = inputElems.password.value;

  const client = await createMatrixClient();
  const userId = `@${username}:${MATRIX_DOMAIN}`;
  client
    .login("m.login.password", { user: userId, password })
    .then((response) => {
      if (response.access_token) {
        window.localStorage.setItem(
          MATRIX_LOGIN_LOCAL_STORAGE_KEY,
          JSON.stringify({
            accessToken: response.access_token,
            userId,
          })
        );
        window.location.replace("index.html");
        return;
      }
      throw new Error("no access token");
    })
    .catch((error) => {
      alert("Login failed");
      console.log(error);
    });
}

function onPageParsed() {
  /** @type {HTMLFormElement} */
  // @ts-ignore
  const loginForm = document.getElementById("login-form");
  loginForm.onsubmit = onLoginSubmit;
}

onPageParsed();
