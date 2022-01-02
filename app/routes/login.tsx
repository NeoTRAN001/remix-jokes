import type { ActionFunction, LinksFunction } from 'remix';
import { useState } from 'react';
import {
  Link,
  useSearchParams,
  json,
  useActionData
} from 'remix';
import { login, createUserSession, register } from '~/utils/session.server';
import { db } from '~/utils/db.server';
import styleUrl from '~/styles/login.css';

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styleUrl }];
};

const badRequest = (data: ActionData) =>
  json(data, { status: 400 });

function validateUsername(username: unknown) {
  if(typeof username !== "string" || username.length < 3)
    return `Usernames must be at least 3 characters long`
}

function validatePassword(password: unknown) {
  if(typeof password !== "string" || password.length < 6)
    return `Passwords must be at least 6 characters long`;
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get('loginType') as string;
  const username = form.get('username') as string;
  const password = form.get('password') as string;
  const redirectTo = form.get('redirectTo') as string || "/jokes";

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password)
  }

  if(Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  switch(loginType) {
    case "login": {
      const user = await login({ username, password });
      
      if(!user) {
        return badRequest({
          fields,
          formError: `Username/Password combination is incorrect`
        });
      }

      return createUserSession(user.id, redirectTo);
    }

    case "register": {
      const userExists = await db.user.findFirst({
        where: { username }
      });

      if(userExists) return badRequest({
        fields,
        formError: `User with username ${username} already exists`
      });

      const user = await register({ username, password });
      if(!user) {
        return badRequest({
          fields,
          formError: `Something wen wrong trying to create a new user.`
        })
      }

      return createUserSession(user.id, redirectTo);
    }

    default: {
      return badRequest({
        fields,
        formError: "Login type invalid"
      })
    }
  }
}

export default function Login() {
  const [loginTypeForm, setLoginTypeForm] = useState(true);
  const actionData = useActionData<ActionData>();
  const [ searchParams ] = useSearchParams();

  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>{ loginTypeForm ? "Login" : "Register"}</h1>
        <form 
          method="post"
          aria-describedby={
            actionData?.formError
              ? "form-error-message"
              : undefined
          }
        >
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />

          <fieldset>
            <legend className="sr-only">
              Login or Register
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked = {
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
                onChange={() => setLoginTypeForm(true)}
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked = { actionData?.fields?.loginType === "register" }
                onChange={() => setLoginTypeForm(false)}
              />{" "}
              Register
            </label>
          </fieldset>

          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-describedby={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData?.fieldErrors?.username}
              </p>
            ): null}
          </div>

          <div>
            <label htmlFor="password-input">Password</label>
            <input
              type="password"
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.password
                ? "password-error"
                : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData?.fieldErrors?.password}
              </p>
            ): null}
          </div>
          
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData?.formError}
              </p>
            ) : null}
          </div>

          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}