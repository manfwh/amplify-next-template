"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./../app/app.css";

const client = generateClient<Schema>();

function TodoList({
  user,
  signOut,
}: {
  user?: { signInDetails?: { loginId?: string } };
  signOut?: () => void;
}) {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content") ?? "",
    });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        <button onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Authenticator loginMechanisms={["email"]}>
      {({ signOut, user }) => <TodoList user={user} signOut={signOut} />}
    </Authenticator>
  );
}
