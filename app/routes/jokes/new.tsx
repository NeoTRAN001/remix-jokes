import type { ActionFunction } from 'remix';
import { redirect, useActionData, json } from 'remix';
import { db } from '~/utils/db.server';

function validateJokeContent(content: string) {
  if(content === null || content === undefined)
    return `That joke is required`;

  if(content.length < 10)
    return `That joke is too short`;
}

function validateJokeName(name: string) {
  if(name === null || name === undefined)
    return `That joke´s name is required`;

  if(name.length < 2)
    return 'That joke´s name is too short';
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
}

const badRequest = (data: ActionData) =>
  json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const name = form.get('name') as string;
  const content = form.get('content') as string;

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content)
  };

  const fields = { name, content };

  if(Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  const joke = await db.joke.create({ data: fields });
  
  return redirect(`/jokes/${joke.id}`);
}

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.name) ||
                undefined
              }
              aria-describedby={
                actionData?.fields?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.name}
            </p>
          ): null}
        </div>
        <div>
          <label>
            Content:
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) ||
                undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content
                ? "content-error"
                : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ): null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}