import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const user = await requireAuth();
  const { data: todos } = await supabase.from("todos").select();

  return (
    <div>
      {JSON.stringify(user)}
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}
