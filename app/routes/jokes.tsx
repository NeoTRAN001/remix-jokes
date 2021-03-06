import { User } from '@prisma/client';
import type { LinksFunction, LoaderFunction } from 'remix';
import { Outlet, Link, useLoaderData } from "remix";
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';
import styleUrl from '~/styles/jokes.css';

type LoaderData = {
  user: User | null,
  jokeListItem: Array<{ id: string; name: string }>;
}

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styleUrl
    }
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const jokeListItem = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' }
  });

  const user = await getUser(request);

  const data: LoaderData = {
    jokeListItem, user
  };

  return data;
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          { data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItem.map(joke => (
                <li key={joke.id}>
                  <Link to={joke.id}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">Add your own</Link>
            </div>
            <div className="jokes-outlet">
              <Outlet />
            </div>
          </div>
        </main>
      </div> 
  );
}